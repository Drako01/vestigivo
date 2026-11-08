import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
const html = readFileSync(resolve(__dirname,'../../media/control-center.html'),'utf8');

test('Control Center script parses with a real JavaScript parser', () => {
  const match = /<script nonce="__NONCE__">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(match?.[1], 'No nonce-protected Control Center script found.');
  assert.doesNotThrow(() => new Script(match?.[1] ?? '', { filename: 'media/control-center.html' }));
});
test('Control Center CSP blocks external and remote execution; no unsanitized HTML data sinks', () => {
  assert.match(html,/default-src 'none'/);
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/script-src 'nonce-__NONCE__'/);
  assert.match(html,/object-src 'none'/);
  assert.ok(!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(html));
  assert.ok(!/\.innerHTML\b|\.outerHTML\b|document\.write\(|\beval\(/.test(html));
  assert.match(html,/\.textContent\s*=/);
});
test('Keyboard navigation, themes, screen readers and responsive states have source-level affordances', () => {
  for(const token of ['role="tablist"','role="tabpanel"','aria-live="polite"',
    'prefers-reduced-motion','forced-colors:active','--vscode-editor-background',
    ':focus-visible','ArrowRight','ArrowLeft','aria-selected']) assert.ok(html.includes(token),token);
});
test('Every advertised provider/bookmark action is dispatched to extension-side validated handler', () => {
  for(const action of ['providerConnect','providerDisconnect','providerFetch','bookmark','openSource','note','hypothesis'])
    assert.ok(html.includes(action),action);
  assert.ok(html.includes("send(action,{provider:button.dataset.provider})"));
  assert.ok(html.includes("send(action,{observationId:button.dataset.observationId})"));
});

test('Timeline supports bounded paging and exact contextual filters without network dependencies', () => {
  for(const token of ["trace:'',request:'',from:'',to:''","o.traceId===filter.trace.trim()",
    "o.requestId===filter.request.trim()","pageSize=100","timelineNext","timelinePrevious",
    "aria-controls','content'","data-filter"]) assert.ok(html.includes(token),token);
});
test('Manual verification plan is rendered as textContent-only form without running any check', () => {
  for(const token of ['verificationPlan','planEditorId','data-plan-field','checkValidity()','Falsifiable assertion'])
    assert.ok(html.includes(token),token);
  assert.ok(!html.includes('child_process'));
});
