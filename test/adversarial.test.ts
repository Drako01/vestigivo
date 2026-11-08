import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEvidence, EvidenceFormatError } from '../src/core/parser';
import { correlate, timeline, traceTree } from '../src/core/correlate';
import { redactIncident, redactText, redactValue } from '../src/core/redact';
import { createCase, importIntoCase, addNote, duplicateCase, loadCase, toggleBookmark, renameCase, compareCases } from '../src/core/case';
import { evaluateVerification, proposeHypothesis } from '../src/core/verification';
import { exportJson, exportMarkdown } from '../src/core/report';
const data = (text: string): Uint8Array => new TextEncoder().encode(text);
const record = (value: object): Uint8Array => data(JSON.stringify(value));

test('Invalid UTF-8 is rejected before JSON parser', () => {
  assert.throws(() => parseEvidence(Uint8Array.from([0xff]), 'invalid.json'), (e: unknown) =>
    e instanceof EvidenceFormatError && e.code === 'UTF8_INVALID');
});
test('Timezone-free and malformed timestamps remain inconclusive, never interpreted in host timezone', () => {
  for (const time of ['2025-01-01T00:00:00', '2025-13-15T00:00:00Z', 'today', 1735689600000]) {
    const result = parseEvidence(record({ message: 'timestamp input', timestamp: time }), 'timestamp.json');
    assert.equal(result.observations[0]?.timestamp, null);
    assert.equal(result.status, 'PARTIAL');
  }
});
test('OTLP nanosecond time retains original precision while rejecting overflow', () => {
  const valid = parseEvidence(record({ resourceLogs: [{ scopeLogs: [{ logRecords: [{
    body: { stringValue: 'ok' }, timeUnixNano: '1735689600000000007' }] }] }] }), 'otel.json');
  assert.equal(valid.observations[0]?.timestampNanoseconds, '1735689600000000007');
  const invalid = parseEvidence(record({ resourceLogs: [{ scopeLogs: [{ logRecords: [{
    body: { stringValue: 'clock outlier' }, timeUnixNano: '9999999999999999999999' }] }] }] }), 'otel.json');
  assert.equal(invalid.observations[0]?.timestamp, null);
});
test('Nested credentials and PII are redacted on structured OTLP paths and report output', () => {
  const otlp = { resourceLogs: [{ resource: { attributes: [
    { key: 'service.name', value: { stringValue: 'payments' } },
    { key: 'client.secret', value: { stringValue: 'very-secret-value' } }] },
    scopeLogs: [{ logRecords: [{
      body: { stringValue: 'Authorization: Basic dXNlcjpwYXNzd29yZA==' },
      attributes: [{ key: 'api.key', value: { stringValue: 'api-secret-token' } }] }] }] }] };
  const imported = parseEvidence(record(otlp), 'traces.json');
  const serialized = exportJson(importIntoCase(createCase(), imported));
  for (const secret of ['very-secret-value','api-secret-token','dXNlcjpwYXNzd29yZA=='])
    assert.equal(serialized.includes(secret), false, 'Leaked secret: '+secret);
});
test('Prototype pollution payload remains an own inert property and cannot alter Object.prototype', () => {
  const input = JSON.parse('{"__proto__":{"polluted":"yes"},"password":"p455w0rd"}') as unknown;
  const clean = redactValue(input) as Record<string, unknown>;
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.equal(Object.getPrototypeOf(clean), null);
  assert.equal(clean.password, '[REDACTED]');
  assert.equal(Object.prototype.hasOwnProperty.call(clean, '__proto__'), true);
});
test('Report redaction does not discard observations after item 128', () => {
  const lines = Array.from({length: 150}, (_, i) =>
    JSON.stringify({message: 'event number '+i, level: 'WARN', traceId: 'shared'})).join('\n');
  const current = importIntoCase(createCase(), parseEvidence(data(lines),'many.jsonl'));
  const sanitized = redactIncident(current);
  assert.equal(sanitized.observations.length, 150);
  const report = JSON.parse(exportJson(current)) as { case: { observations: unknown[] } };
  assert.equal(report.case.observations.length, 150);
  assert.match(exportMarkdown(current), /event number 149/);
});
test('Case budget is explicit on multi-source import and does not store unbounded events', () => {
  const make = (prefix: string, amount: number) => Array.from({length: amount},
    (_, i) => JSON.stringify({message: prefix+i})).join('\n');
  const first = importIntoCase(createCase(), parseEvidence(data(make('A', 5500)), 'a.jsonl'));
  const second = importIntoCase(first, parseEvidence(data(make('B', 5500)), 'b.jsonl'));
  assert.equal(second.observations.length, 10000);
  assert.ok(second.limitations.some(s => s.includes('1000 records excluded')));
});
test('Migration from schema 0 retains observations, sources and audit without inventing findings', () => {
  const imported = importIntoCase(createCase('A historical incident'), parseEvidence(data('{"message":"failure"}'),'a.json'));
  const legacy = { ...imported, schemaVersion: 0, archived: undefined, notes: undefined,
    observations: imported.observations.map(o => ({ ...o, schemaVersion: 0 })) };
  const migrated = loadCase(JSON.parse(JSON.stringify(legacy)) as unknown);
  assert.equal(migrated.schemaVersion, 1);
  assert.equal(migrated.observations.length, imported.observations.length);
  assert.deepEqual(migrated.sources.map(s => s.sha256), imported.sources.map(s => s.sha256));
  assert.equal(migrated.audit.length, imported.audit.length);
  assert.equal(migrated.archived, false);
});
test('Reopened valid case preserves notes and can be duplicated independently', () => {
  const a = addNote(importIntoCase(createCase(), parseEvidence(data('{"message":"error"}'),'a.json')), 'Checked with operator');
  const b = loadCase(JSON.parse(JSON.stringify(redactIncident(a))) as unknown);
  assert.equal(b.notes[0]?.text, 'Checked with operator');
  const copied = duplicateCase(b);
  assert.notEqual(copied.id, b.id);
  assert.equal(copied.observations.length, b.observations.length);
});
test('Corrupt or hostile local case data fails closed at validation boundary', () => {
  const good = createCase();
  assert.throws(() => loadCase({ ...good, schemaVersion: 99 }));
  assert.throws(() => loadCase({ ...good, id: '../etc/passwd' }));
  assert.throws(() => loadCase({ ...good, archived: 'yes' }));
  assert.throws(() => loadCase({ ...good, observations: [{ id: 'fake', state: 'CONFIRMED' }] }));
  assert.throws(() => loadCase({ ...good, limitations: Array.from({length:101}, ()=>'x') }));
});
test('No exact correlation across distinct trace/request IDs even at identical timestamps', () => {
  const obs = parseEvidence(record([
    { message: 'a', traceId: 'trace-A', requestId: 'req-A', timestamp: '2025-01-01T00:00:00Z' },
    { message: 'b', traceId: 'trace-B', requestId: 'req-B', timestamp: '2025-01-01T00:00:00Z' }
  ]),'a.json').observations;
  assert.equal(correlate(obs).length, 0);
  assert.equal(timeline(obs).length, 2);
});
test('Unresolved parent span is identified, never silently connected to unrelated trace', () => {
  const obs = parseEvidence(record([{ message: 'orphan', traceId: 'trace-A',
    spanId: 'child', parentSpanId: 'parent' }]),'a.json').observations;
  assert.equal(traceTree(obs)[0]?.missingParent, true);
});
test('Hypothesis must be falsifiable length and untrusted reproduction is inconclusive', () => {
  assert.throws(() => proposeHypothesis('error'));
  const h = proposeHypothesis('A controlled feature flag caused this regression.');
  const base = { id:'baseline', testId:'test-id', inputHash:'x', configHash:'y', environmentHash:'z', versionHash:'before' };
  const current = { ...base, id:'current', versionHash:'after' };
  const input = { assertion: 'Disabling the flag removes the specific failure.', testId:'test-id',
    evidenceIds:['observed'], baseline:base, current, baselinePassed:true, currentFailed:true,
    causalIntervention:true, controlledEnvironment:true, repeatedCurrentFailures:2 };
  assert.equal(evaluateVerification(h, input).state,'CONFIRMED');
  assert.equal(evaluateVerification(h,{ ...input, baseline:null }).state,'INCONCLUSIVE');
  assert.equal(evaluateVerification(h,{ ...input, current:{...current,inputHash:'new'} }).state,'INCONCLUSIVE');
  assert.equal(evaluateVerification(h,{ ...input, causalIntervention:false }).state,'INCONCLUSIVE');
  assert.equal(evaluateVerification(h,{ ...input, controlledEnvironment:false }).state,'INCONCLUSIVE');
  assert.equal(evaluateVerification(h,{ ...input, evidenceIds:[] }).state,'INCONCLUSIVE');
  assert.equal(evaluateVerification(h,{ ...input, repeatedCurrentFailures:0 }).state,'INCONCLUSIVE');
});
test('Malformed JSONL, deep JSON, long lines and invalid budget explicitly fail or partially import', () => {
  const malformed = parseEvidence(data('{"message":"safe"}\n{"unterminated":'),'bad.jsonl');
  assert.equal(malformed.status,'PARTIAL');
  assert.throws(()=>parseEvidence(data('{ "a": { "b": { "message": "too deep" } } }'), 'a.json', {maxDepth:2}),EvidenceFormatError);
  assert.equal(parseEvidence(data('{"message":"ok"}\n{"message":"'+ 'x'.repeat(200) +'"}'),'a.jsonl',{maxLineLength:100}).status,'PARTIAL');
  assert.throws(()=>parseEvidence(data('{"message":"x"}'),'a.json',{maxEvents:0}),EvidenceFormatError);
});
test('Source filename is sanitized, no implicit scanning or path interpretation', () => {
  const evidence = parseEvidence(data('{"message":"safe"}'), '/tmp/private/folder/request.json');
  assert.equal(evidence.source.name,'request.json');
  assert.equal(evidence.observations[0]?.state,'OBSERVED');
  assert.ok(evidence.source.sha256.length===64);
});
test('Redacted note and authorization header have no retained secret', () => {
  const input = 'Authorization: Basic abcdefghijklm and person@example.com';
  assert.ok(!redactText(input).includes('abcdefghijklm'));
  assert.ok(!redactText(input).includes('person@example.com'));
  const incident = addNote(createCase(),'password=very-secret-value');
  assert.ok(!exportJson(incident).includes('very-secret-value'));
});

test('Oversized Markdown export is rejected rather than silently cut', () => {
  const logs = Array.from({length: 150}, (_,i) => JSON.stringify({message: 'message'+i+'x'.repeat(14900)})).join('\n');
  const incident = importIntoCase(createCase(),parseEvidence(data(logs),'many.jsonl'));
  assert.throws(() => exportMarkdown(incident), /exceeds.*limit/);
});

test('Trace tree labels cyclic and duplicated parent IDs rather than inventing a hierarchy', () => {
  const cycle = parseEvidence(record([
    {message:'A',traceId:'trace1',spanId:'a',parentSpanId:'b'},
    {message:'B',traceId:'trace1',spanId:'b',parentSpanId:'a'}
  ]),'cycles.json');
  assert.ok(traceTree(cycle.observations).every(n => n.cycleDetected));
  const ambiguous = parseEvidence(record([
    {message:'parent 1',traceId:'trace1',spanId:'p'},
    {message:'parent 2',traceId:'trace1',spanId:'p'},
    {message:'child',traceId:'trace1',spanId:'c',parentSpanId:'p'}
  ]),'duplicates.json');
  assert.equal(traceTree(ambiguous.observations).find(n=>n.observation.spanId==='c')?.ambiguousParent,true);
});

test('Case bookmarks, rename and baseline comparison are auditable and never claim resolution', () => {
  const baseline = importIntoCase(createCase(),parseEvidence(data('{"message":"old failure"}'),'original.json'));
  const id = baseline.observations[0]!.id;
  const bookmarked = toggleBookmark(baseline,id);
  assert.deepEqual(bookmarked.bookmarks,[id]);
  assert.equal(toggleBookmark(bookmarked,id).bookmarks?.length,0);
  assert.throws(()=>toggleBookmark(baseline,'000000000000000000000000'),/not in this case/);
  assert.throws(()=>renameCase(baseline,'a'),/at least 3/);
  assert.equal(renameCase(baseline,'New incident title').title,'New incident title');
  const restored = loadCase(JSON.parse(JSON.stringify(bookmarked)) as unknown);
  assert.deepEqual(restored.bookmarks,[id]);
  const comparison = compareCases(baseline,createCase('Independent observation set'));
  assert.equal(comparison.absent.length,1);
  assert.match(comparison.note,/not proof/);
});
