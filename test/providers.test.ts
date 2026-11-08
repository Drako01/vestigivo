import { test } from 'node:test';
import assert from 'node:assert/strict';
import type * as vscode from 'vscode';
import { ProviderClient, validateProviderConnection } from '../src/adapters/providers';
type SecretMock = vscode.SecretStorage;
function secrets(): SecretMock {
  const values = new Map<string, string>();
  return {
    get: async key => values.get(key),
    store: async (key, value) => { values.set(key, value); },
    delete: async key => { values.delete(key); },
    keys: async () => [...values.keys()],
    onDidChange: (()=>({dispose:()=>{}})) as SecretMock['onDidChange']
  };
}
test('Provider origin refuses private host, custom ports, redirects, secrets and paths', () => {
  const bad = ['http://sentry.io','https://127.0.0.1','https://sentry.io.evil.com',
    'https://user:pass@sentry.io','https://sentry.io:8080','https://sentry.io/redirect',
    'https://sentry.io?token=leak','https://localhost'];
  for (const endpoint of bad)
    assert.throws(() => validateProviderConnection('sentry',{ endpoint,organization:'org' }),endpoint);
  assert.throws(() => validateProviderConnection('grafana',{endpoint:'https://127.0.0.1'}));
  assert.throws(() => validateProviderConnection('grafana',{endpoint:'https://grafana.net'}));
  assert.equal(validateProviderConnection('sentry',{endpoint:'https://sentry.io',organization:'org'}).endpoint,'https://sentry.io');
  assert.equal(validateProviderConnection('grafana',{endpoint:'https://stack.grafana.net'}).endpoint,'https://stack.grafana.net');
});
test('No provider network traffic before connecting or after disconnect', async () => {
  let called = 0;
  const transport = (async ()=>{ called++;return new Response('[]'); }) as typeof fetch;
  const client = new ProviderClient(secrets(),transport);
  await assert.rejects(client.list('sentry'));
  assert.equal(called,0);
  await client.connect('sentry','valid-token-123',{endpoint:'https://sentry.io',organization:'org'});
  assert.ok(await client.connection('sentry'));
  await client.disconnect('sentry');
  assert.equal(await client.connection('sentry'),null);
  await assert.rejects(client.list('sentry'));
  assert.equal(called,0);
});
test('Sentry GET uses documented organization route; no local evidence in request', async () => {
  const requests: Array<{url: string; options: RequestInit}> = [];
  const transport = (async (url: string | URL | Request,options?:RequestInit)=>{
    requests.push({ url: String(url),options:options ?? {} });
    return new Response(JSON.stringify([{id:'11',title:'Bearer ABCDEFGH1234',project:{slug:'payments'},lastSeen:'2025-01-01T00:00:00Z'}]),
      {status:200,headers:{'content-type':'application/json'}});
  }) as typeof fetch;
  const client = new ProviderClient(secrets(),transport);
  await client.connect('sentry','secret-access-token',{endpoint:'https://sentry.io',organization:'my-org',project:'api'});
  const result=await client.list('sentry','is:unresolved');
  assert.equal(result.entries[0]?.id,'11');
  assert.ok(!result.entries[0]?.title.includes('ABCDEFGH'));
  assert.equal(result.entries[0]?.service,'payments');
  assert.ok(requests[0]?.url.startsWith('https://sentry.io/api/0/organizations/my-org/issues/'));
  assert.equal(requests[0]?.options.method,'GET');
  assert.equal(requests[0]?.options.redirect,'error');
  assert.equal(requests[0]?.options.body,undefined);
  assert.ok(!requests[0]?.url.includes('secret-access-token'));
});
test('Grafana Cloud queries documented annotations API via GET, bounded list', async () => {
  let seen='';
  const transport=(async (url:string|URL|Request)=>{seen=String(url);return new Response(JSON.stringify({items:[
    {metadata:{name:'a-1'},spec:{text:'A deployment happened',time:1735689600000,dashboardUID:'api'}}]}));}) as typeof fetch;
  const client=new ProviderClient(secrets(),transport);
  await client.connect('grafana','grafana-read-token',{endpoint:'https://stack.grafana.net',namespace:'default'});
  const result=await client.list('grafana');
  assert.match(seen,/\/apis\/annotation\.grafana\.app\/v0alpha1\/namespaces\/default\/annotations\?limit=25/);
  assert.equal(result.entries[0]?.title,'A deployment happened');
  assert.equal(result.entries[0]?.kind,'annotation');
});
test('Provider status/invalid schema/rate responses fail closed with bounded errors', async () => {
  for (const status of [401,403,404,429,500]) {
    const client=new ProviderClient(secrets(),(async ()=>new Response('{}',{status})) as typeof fetch);
    await client.connect('sentry','valid-token-123',{endpoint:'https://sentry.io',organization:'org'});
    await assert.rejects(client.list('sentry'),/HTTP /);
  }
  const malformed=new ProviderClient(secrets(),(async ()=>new Response('{}')) as typeof fetch);
  await malformed.connect('sentry','valid-token-123',{endpoint:'https://sentry.io',organization:'org'});
  await assert.rejects(malformed.list('sentry'),/Unexpected provider schema/);
});
test('Provider response max-size applies even when server lacks content-length', async () => {
  const big = new Response('x'.repeat(600_000),{headers:{'content-length':'0'}});
  const client=new ProviderClient(secrets(),(async ()=>big) as typeof fetch);
  await client.connect('sentry','valid-token-123',{endpoint:'https://sentry.io',organization:'org'});
  await assert.rejects(client.list('sentry'),/budget/);
});
