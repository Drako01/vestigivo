import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEvidence } from '../src/core/parser';
import { createCase, importIntoCase, loadCase, duplicateCase } from '../src/core/case';
import { evaluateVerification, proposeHypothesis } from '../src/core/verification';
import { traceTree } from '../src/core/correlate';

const bytes = (text: string): Uint8Array => new TextEncoder().encode(text);
const parse = (value: unknown, name = 'source.json') => parseEvidence(bytes(JSON.stringify(value)), name);
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

test('Hostile JSONL diagnostics are bounded without reporting a complete import', () => {
  const lines = ['{"message":"valid observation"}', ...Array.from({ length: 600 }, () => '{broken')];
  const result = parseEvidence(bytes(lines.join('\n')), 'hostile.jsonl');
  assert.equal(result.status, 'PARTIAL');
  assert.equal(result.observations.length, 1);
  assert.equal(result.issues.length, 50);
  assert.match(result.issues[49]!, /additional import issues/);
});

test('Calendar validation never normalizes impossible timestamps into different dates', () => {
  for (const timestamp of ['2025-02-29T12:00:00Z','2025-02-30T12:00:00Z','2025-04-31T12:00:00Z',
    '2025-01-01T24:00:00Z','2025-01-01T12:60:00Z','2025-01-01T12:00:00+01:70']) {
    const result = parse({message:'event',timestamp});
    assert.equal(result.observations[0]?.timestamp, null, timestamp);
    assert.equal(result.status, 'PARTIAL');
  }
  assert.equal(parse({message:'leap',timestamp:'2024-02-29T12:00:00Z'}).status, 'COMPLETE');
});

test('Nested OTLP attributes with prototype-like keys remain inert and bounded', () => {
  const nested = (depth: number): unknown => depth === 0 ? {stringValue:'leaf'} : {
    kvlistValue:{values:[{key:'nested',value:nested(depth-1)}]}
  };
  const data = {resourceLogs:[{scopeLogs:[{logRecords:[{
    body:{stringValue:'safe'},attributes:[
      {key:'__proto__',value:{stringValue:'inert'}},
      {key:'constructor',value:{stringValue:'inert'}},
      {key:'deep',value:nested(20)}
    ]
  }]}]}]};
  const result = parse(data);
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.equal(Object.hasOwn(result.observations[0]!.attributes,'__proto__'),true);
  assert.equal(JSON.stringify(result.observations[0]!.attributes).includes('TRUNCATED DEPTH'),true);
});

test('Stored case rejects duplicate observations, disconnected provenance and invalid bookmarks', () => {
  const incident = importIntoCase(createCase(),parse([{message:'one'},{message:'two'}]));
  assert.throws(() => loadCase({...incident,observations:[...incident.observations,clone(incident.observations[0]!)]}),
    /Duplicate observation ID/);
  const foreign = clone(incident);
  foreign.observations[0]!.provenance.sourceId = 'unknown-source';
  assert.throws(()=>loadCase(foreign),/Invalid observation/);
  const conflicting = clone(incident);
  conflicting.observations[0]!.provenance.importId = 'another-import';
  assert.throws(()=>loadCase(conflicting),/Invalid observation/);
  assert.throws(()=>loadCase({...incident,bookmarks:['0'.repeat(24)]}),/Bookmark refers/);
  assert.equal(loadCase(clone(incident)).observations.length,2);
});

test('Repeated import preserves immutable observation and source quotas reject atomically', () => {
  const incoming = parse({message:'first'});
  const first = importIntoCase(createCase(), incoming);
  const mutated = clone(incoming);
  mutated.observations[0]!.message = 'overwritten value';
  assert.equal(importIntoCase(first, mutated).observations[0]?.message, 'first');
  const full = {...first, sources:Array.from({length:100},(_,i)=>({...first.sources[0]!,id:'dummy-'+i}))};
  const snapshot = JSON.stringify(full);
  assert.throws(()=>importIntoCase(full,parse({message:'new'},'different.json')),/source budget/);
  assert.equal(JSON.stringify(full),snapshot);
  const long = {...first,title:'x'.repeat(180)};
  assert.equal(duplicateCase(long).title.length,180);
});

test('A confirmed RCA requires an actual baseline/current version distinction', () => {
  const hypothesis = proposeHypothesis('A controlled change explains the exact observed failure.');
  const baseline = {id:'base',testId:'strict-check',inputHash:'a',configHash:'b',environmentHash:'c',versionHash:'same'};
  const input = {assertion:'A controlled change flips the same assertion.',testId:'strict-check',
    evidenceIds:['record'],baseline,current:{...baseline,id:'current'},
    baselinePassed:true,currentFailed:true,causalIntervention:true,controlledEnvironment:true,repeatedCurrentFailures:2};
  assert.equal(evaluateVerification(hypothesis,input).state,'INCONCLUSIVE');
  const confirmed = evaluateVerification(hypothesis,{...input,current:{...baseline,versionHash:'changed'}});
  assert.equal(confirmed.state,'CONFIRMED');
  const incident = {...createCase(),hypotheses:[confirmed]};
  assert.equal(loadCase(clone(incident)).hypotheses[0]?.state,'CONFIRMED');
  const invalid = clone(incident);
  invalid.hypotheses[0]!.verification!.current!.versionHash = 'same';
  assert.throws(()=>loadCase(invalid),/Invalid persisted hypothesis/);
});

test('Very long parent-span chains resolve iteratively without stack overflow', () => {
  const count = 2200;
  const records = Array.from({length:count},(_,i)=>({
    message:'span '+i,traceId:'shared-trace',spanId:'span-'+i,
    ...(i>0 ? {parentSpanId:'span-'+(i-1)} : {})
  }));
  const tree = traceTree(parse(records).observations);
  assert.equal(tree.length,count);
  assert.ok(tree.every(node=>!node.cycleDetected && !node.ambiguousParent && !node.missingParent));
  const orphan = [...records,{message:'orphan',traceId:'shared-trace',spanId:'orphan',parentSpanId:'not-present'}];
  assert.equal(traceTree(parse(orphan).observations).find(n=>n.observation.spanId==='orphan')?.missingParent,true);
});
