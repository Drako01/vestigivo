import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');
const workflow = readFileSync(resolve(root, '.github/workflows/publish.yml'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {version:string, publisher:string, name:string};
const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8')) as {version:string, packages:Record<string,{version:string}>};

test('0.1.2 release manifest and root lockfile agree', () => {
  assert.equal(manifest.version, '0.1.2');
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages['']?.version, manifest.version);
  assert.equal(manifest.publisher, 'armotusitio');
  assert.equal(manifest.name, 'vestigivo');
});

test('GitHub Release is gated by both OIDC registry publications', () => {
  const release = workflow.split('\n  github-release:\n')[1];
  assert.ok(release, 'GitHub Release job missing');
  assert.match(workflow, /on:\s*\n\s+push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(release, /needs: \[authorize, package, marketplace, open-vsx\]/);
  assert.match(release, /if: needs\.authorize\.outputs\.publish == 'true'/);
  assert.match(release, /environment: github-release/);
  assert.match(release, /permissions:\s*\n\s+contents: write/);
  assert.match(release, /gh release create "\$tag" "\$asset" SHA256SUMS/);
});

test('GitHub Release verifies immutable version tag and unchanged VSIX bytes', () => {
  const release = workflow.split('\n  github-release:\n')[1] ?? '';
  assert.match(release, /gh api "repos\/\$GH_REPO\/git\/ref\/heads\/main"/);
  assert.match(release, /if \[\[ "\$current_main" != "\$GITHUB_SHA" \]\]/);
  assert.match(release, /gh api "repos\/\$GH_REPO\/git\/ref\/tags\/\$tag"/);
  assert.match(release, /recorded.*gh api/);
  assert.match(release, /gh release view "\$tag"/);
  assert.match(release, /--verify-tag/);
  assert.match(release, /cmp SHA256SUMS/);
  assert.match(release, /cmp "\$asset"/);
  assert.ok(!/\bnpm run build\b|\bvsce package\b/.test(release),
    'GitHub Release must never rebuild the VSIX');
  assert.ok(!/\bgh release upload\b/.test(release),
    'An existing GitHub Release must not have assets overwritten');
});

test('Marketplace and Open VSX still use separate protected OIDC environments', () => {
  const m = workflow.split('\n  marketplace:\n')[1]?.split('\n  open-vsx:\n')[0] ?? '';
  const o = workflow.split('\n  open-vsx:\n')[1]?.split('\n  github-release:\n')[0] ?? '';
  for (const [name, text, environment] of [['Marketplace',m,'marketplace'],['Open VSX',o,'open-vsx']] as const) {
    assert.match(text, new RegExp('environment: '+environment), name);
    assert.match(text, /id-token: write/, name);
    assert.match(text, /sha256sum --check SHA256SUMS/, name);
  }
  assert.match(m, /vsce publish --oidc/);
  assert.match(o, /ovsx publish .*--trusted-publishing/);
});
