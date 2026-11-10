'use strict';
/** Screenshot release gate: real PNGs in the README, reproducible synthetic fixture. */
const assert = require('node:assert/strict');
const { readFileSync, statSync, existsSync } = require('node:fs');
const { createHash } = require('node:crypto');
const images = [
  'media/screenshots/01-overview.png',
  'media/screenshots/02-timeline.png',
  'media/screenshots/03-trace-tree.png',
  'media/screenshots/04-case-studio.png'
];
// The new PR captures these from genuine VS Code after base CI. The next PR
// revision enforces the complete six-image set, avoiding a bootstrap deadlock.
const newViews = [
  'media/screenshots/05-evidence-provenance.png',
  'media/screenshots/06-redacted-report.png'
];
const present = newViews.filter(existsSync);
assert(present.length === 0 || present.length === 2,
  'New evidence/report screenshots must be committed as one validated set');
images.push(...present);
const readme=readFileSync('README.md','utf8');
const unique=new Set();
for(const path of images){
  assert(readme.includes(']('+path+')') || readme.includes('src="'+path+'"'),
    'README is missing actual screenshot: '+path);
  const b=readFileSync(path);
  assert(statSync(path).size>=15000 && statSync(path).size<=4*1024*1024,
    'Screenshot is empty, excessively small or over budget: '+path);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',
    'Screenshot is not a real PNG file: '+path);
  assert.equal(b.readUInt32BE(16),1440,'Screenshot width mismatch: '+path);
  assert.equal(b.readUInt32BE(20),900,'Screenshot height mismatch: '+path);
  unique.add(createHash('sha256').update(b).digest('hex'));
}
assert.equal(unique.size,images.length,'Screenshots must represent different actual UI views');
const fixture=readFileSync('test/fixtures/visual-demo.jsonl','utf8').trim().split(/\r?\n/);
assert(fixture.length>=10 && fixture.length<=100,'Synthetic fixture count out of budget');
for(const line of fixture){
  const record=JSON.parse(line);
  assert.equal(record.attributes?.['demo.synthetic'],true,
    'A screenshot fixture record is not explicitly marked synthetic');
  assert(typeof record.message === 'string' && record.message.length <= 300,
    'Synthetic fixture message is invalid');
}
assert(readme.includes('actual Vestigivo RCA webview') || readme.includes('actual Vestigivo RCA'),
  'README must disclose screenshot origin');
assert(readme.includes('synthetic fixture'),
  'README must disclose synthetic data');
console.log('SCREENSHOTS PASS: ' + images.length + ' distinct 1440x900 authentic PNG captures, README links, synthetic provenance.' +
  (present.length === 0 ? ' New v0.2.0 views pending CI capture.' : ''));
