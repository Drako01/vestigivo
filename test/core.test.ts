import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEvidence, EvidenceFormatError } from '../src/core/parser';
import { redactText, redactValue } from '../src/core/redact';
import { correlate, timeline, traceTree } from '../src/core/correlate';
import { createCase, importIntoCase, compareCases } from '../src/core/case';
import { exportJson, exportMarkdown } from '../src/core/report';
import { evaluateVerification, proposeHypothesis } from '../src/core/verification';
const bytes = (s: string): Uint8Array => new TextEncoder().encode(s);
test('JSONL sources preserve line provenance, timestamps and deduplicate stable IDs', () => {
  const source = '{"timestamp":"2025-01-01T00:00:00Z","message":"error","traceId":"abc","service":"api"}\n{"timestamp":"2025-01-01T00:00:01Z","message":"ok","traceId":"abc"}';
  const first = parseEvidence(bytes(source), 'incident.jsonl', { importedAt: '2025-01-01T00:00:00Z' });
  assert.equal(first.observations.length, 2);
  assert.equal(first.observations[1]?.provenance.line, 2);
  assert.equal(first.observations[0]?.id, parseEvidence(bytes(source), 'incident.jsonl').observations[0]?.id);
  const combined = importIntoCase(createCase(), first);
  assert.equal(combined.correlations.length, 1);
  assert.equal(importIntoCase(combined, first).observations.length, 2);
});
test('OTLP typed resource attributes, logs and spans including ns timestamps', () => {
  const source = { resourceSpans: [{ resource: { attributes: [{ key: 'service.name', value: { stringValue: 'orders' } }] },
    scopeSpans: [{ spans: [{ name: 'fetch', traceId: 'ff', spanId: '01', startTimeUnixNano: '1735689600000000001', attributes: [{ key: 'http.status_code', value: { intValue: '500' } }] }] }] }],
    resourceLogs: [{ resource: { attributes: [{ key: 'service.name', value: { stringValue: 'orders' } }] },
      scopeLogs: [{ logRecords: [{ body: { stringValue: 'failure' }, traceId: 'ff', timeUnixNano: '1735689600000000000' }] }] }] };
  const result = parseEvidence(bytes(JSON.stringify(source)), 'otel.json');
  assert.equal(result.source.format, 'otlp-json');
  assert.equal(result.observations[0]?.timestampNanoseconds, '1735689600000000001');
  assert.equal(result.observations[0]?.service, 'orders');
  assert.equal(result.observations.length, 2);
  assert.equal(correlate(result.observations).length, 1);
  assert.equal(traceTree(result.observations).length, 1);
});
test('Correlator never joins incompatible trace IDs or merely adjacent timestamps', () => {
  const a = parseEvidence(bytes('[{"traceId":"aa","message":"a","timestamp":"2025-01-01T00:00:00Z"},{"traceId":"bb","message":"b","timestamp":"2025-01-01T00:00:00Z"}]'), 'events.json');
  assert.equal(correlate(a.observations).length, 0);
  assert.equal(timeline(a.observations).length, 2);
});
test('Partial and hostile imports are explicit', () => {
  const partial = parseEvidence(bytes('{"message":"ok"}\nnot json'), 'x.jsonl');
  assert.equal(partial.status, 'PARTIAL'); assert.equal(partial.issues.length, 1);
  assert.throws(() => parseEvidence(bytes(''), 'x.json'), EvidenceFormatError);
  assert.throws(() => parseEvidence(bytes('{}'), 'x.json'), EvidenceFormatError);
  assert.throws(() => parseEvidence(bytes('{"a":{"b":{"c":1}}}'), 'x.json', { maxDepth: 2 }), EvidenceFormatError);
  assert.throws(() => parseEvidence(bytes('{"message":"hello"}'), 'x.yaml'), EvidenceFormatError);
  assert.throws(() => parseEvidence(bytes('{"message":"hello"}'), 'x.json', { maxBytes: 1 }), EvidenceFormatError);
});
test('Redaction protects nested secrets, tokens, emails and ANSI sequences', () => {
  assert.ok(!redactText('Bearer abcdef1234567 admin@example.com \u001b[31m').includes('abcdef'));
  assert.deepEqual(redactValue({ nested: { access_token: 'secret', regular: 'hello' } }),
    { nested: { access_token: '[REDACTED]', regular: 'hello' } });
  const result = parseEvidence(bytes('{"message":"Bearer abcdef1234567","attributes":{"apiKey":"hidden"}}'), 'x.json');
  const report = exportJson(importIntoCase(createCase(), result));
  assert.ok(!report.includes('hidden') && !report.includes('abcdef1234567'));
  assert.ok(exportMarkdown(importIntoCase(createCase(), result)).includes('Observed timeline'));
});
test('RCA verification refuses correlation-only, noncomparable, single reproduction', () => {
  const h = proposeHypothesis('Feature switch causes the observed error.');
  const fingerprint = { id: 'a', testId: 'controlled-test', inputHash: 'inputs', configHash: 'config', environmentHash: 'env', versionHash: 'v1' };
  const baseline = { ...fingerprint, versionHash: 'v0' };
  const input = { assertion: 'Toggling the feature changes the controlled result.', testId: 'controlled-test',
    evidenceIds: ['e'], baseline, current: fingerprint,
    baselinePassed: true, currentFailed: true, causalIntervention: true, controlledEnvironment: true, repeatedCurrentFailures: 2 };
  assert.equal(evaluateVerification(h, { ...input, causalIntervention: false }).state, 'INCONCLUSIVE');
  assert.equal(evaluateVerification(h, { ...input, repeatedCurrentFailures: 1 }).state, 'INCONCLUSIVE');
  assert.equal(evaluateVerification(h, { ...input, current: { ...fingerprint, environmentHash: 'different' } }).state, 'INCONCLUSIVE');
  assert.equal(evaluateVerification(h, input).state, 'CONFIRMED');
});
test('Case comparison never labels missing observation resolved', () => {
  const a = importIntoCase(createCase(), parseEvidence(bytes('{"message":"failure"}'), 'a.json'));
  const b = createCase();
  assert.equal(compareCases(a, b).absent.length, 1);
  assert.match(compareCases(a, b).note, /not proof/);
});
