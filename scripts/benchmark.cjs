'use strict';
/** Deterministic benchmark: Node 22, precompiled core, no network or synthetic pass labels. */
const os = require('node:os');
const { performance } = require('node:perf_hooks');
const { parseEvidence, EvidenceFormatError } = require('../dist/src/core/parser');
const { correlate } = require('../dist/src/core/correlate');
const { exportMarkdown } = require('../dist/src/core/report');
const { createCase, importIntoCase } = require('../dist/src/core/case');
const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const runs = 7;
function fixture(amount) {
  const lines = new Array(amount);
  for (let i = 0; i < amount; i++) {
    lines[i] = JSON.stringify({
      timestamp: new Date(1735689600000 + i).toISOString(),
      service: 'service-' + (i % 5),
      level: i % 11 === 0 ? 'ERROR' : 'INFO',
      traceId: 'trace-' + Math.floor(i / 7),
      spanId: 'span-' + i,
      message: 'deterministic observation #' + i
    });
  }
  return new TextEncoder().encode(lines.join('\n'));
}
function stats(data) {
  const sorted = [...data].sort((a, b) => a - b);
  return {
    p50Ms: Number(sorted[Math.ceil(sorted.length * 0.50) - 1].toFixed(3)),
    p95Ms: Number(sorted[Math.ceil(sorted.length * 0.95) - 1].toFixed(3)),
    samples: sorted.map(x => Number(x.toFixed(3)))
  };
}
function timed(fn) {
  const t = performance.now(), value = fn();
  return { duration: performance.now() - t, value };
}
function testCase(count) {
  const bytes = fixture(count), parse = [], group = [], filter = [], report = [];
  let received = 0, sourceStatus = 'UNKNOWN';
  for (let r = 0; r < runs; r++) {
    const parsed = timed(() => parseEvidence(bytes, 'bench.jsonl', {maxBytes: 8 * 1024 * 1024,maxEvents:10000}));
    parse.push(parsed.duration);
    received = parsed.value.observations.length;
    sourceStatus = parsed.value.status;
    group.push(timed(() => correlate(parsed.value.observations)).duration);
    filter.push(timed(() => parsed.value.observations.filter(o => o.severity === 'ERROR' && o.service === 'service-1')).duration);
    const session = importIntoCase(createCase('Deterministic synthetic benchmark'),parsed.value);
    report.push(timed(() => exportMarkdown(session)).duration);
  }
  return {records: count, sourceBytes:bytes.byteLength, acceptedRecords:received, sourceStatus,
    parse:stats(parse), correlate:stats(group), filter:stats(filter), exportMarkdown:stats(report),
    rssAfterBytes:process.memoryUsage().rss};
}
const results = [testCase(1000),testCase(10000)];
const huge = fixture(100000);
let rejection = {records:100000, sourceBytes:huge.byteLength, status:'UNKNOWN'};
try {
  const imported = parseEvidence(huge,'huge.jsonl',{maxBytes:8*1024*1024,maxEvents:10000});
  rejection = {...rejection,status:imported.status,acceptedRecords:imported.observations.length};
} catch(error) {
  rejection = {...rejection,status:error instanceof EvidenceFormatError?error.code:'UNEXPECTED_ERROR'};
}
if (!['SIZE_LIMIT', 'PARTIAL'].includes(rejection.status)) {
  throw new Error('100K fixture must reject or explicitly truncate against configured budgets.');
}
if (results.some(item => item.acceptedRecords !== item.records || item.sourceStatus !== 'COMPLETE')) {
  throw new Error('1K/10K fixtures must import entirely and deterministically within 8 MiB.');
}
const output={
  schemaVersion:1, tool:'Vestigivo RCA deterministic core benchmark',
  type:'synthetic benchmark; not an Extension Host FPS/scroll measurement',
  samplesPerCase:runs, environment:{
    node:process.version,platform:process.platform,arch:process.arch,
    cpus:os.cpus().length,cpuModel:os.cpus()[0]?.model??'unknown',
    totalMemoryBytes:os.totalmem()
  },
  budgets:{maxBytes:8*1024*1024,maxEventsPerCase:10000},
  results,largeSource:rejection,
  rssObservedEndBytes:process.memoryUsage().rss,
  processPeakRssKiB:process.resourceUsage().maxRSS,
  note:'P50/P95 from seven samples on one runner; not a cross-platform SLA. Chrome Webview render/scroll is not measured.'
};
const json=JSON.stringify(output,null,2)+'\n';
writeFileSync(resolve('benchmark-result.json'),json,{encoding:'utf8',flag:'w'});
process.stdout.write(json);
