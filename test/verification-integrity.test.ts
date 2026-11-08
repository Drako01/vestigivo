import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCase, loadCase } from '../src/core/case';
import { compareCheckOutcomes, evaluateVerification, proposeHypothesis } from '../src/core/verification';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const fp = { id: 'before', testId: 't', inputHash: 'a', configHash: 'b', environmentHash: 'c', versionHash: 'v1' };
const result = () => evaluateVerification(proposeHypothesis('The controlled change explains this specific failing assertion.'), {
  assertion: 'Explicit controlled test changed the observed result.', testId: 't', evidenceIds: ['observed-record'],
  baseline: fp, current: { ...fp, id: 'after', versionHash: 'v2' },
  baselinePassed: true, currentFailed: true, causalIntervention: true,
  controlledEnvironment: true, repeatedCurrentFailures: 3
});
test('Stored confirmation requires consistent identifiers, fingerprints and causal gates', () => {
  const confirmed = result();
  assert.equal(confirmed.state, 'CONFIRMED');
  const incident = { ...createCase(), hypotheses: [confirmed] };
  assert.equal(loadCase(clone(incident)).hypotheses[0]?.state, 'CONFIRMED');
  for (const modify of [
    (h: typeof confirmed) => { h.verification!.hypothesisId = 'another-hypothesis'; },
    (h: typeof confirmed) => { h.verification!.baseline = null; },
    (h: typeof confirmed) => { h.verification!.current = { ...fp, inputHash: 'different' }; },
    (h: typeof confirmed) => { h.verification!.repeatedCurrentFailures = 1; },
    (h: typeof confirmed) => { h.verification!.causalIntervention = false; },
    (h: typeof confirmed) => { h.verification!.evidenceIds = []; },
    (h: typeof confirmed) => { h.verification!.status = 'INCONCLUSIVE'; },
    (h: typeof confirmed) => { h.verification!.baseline!.environmentHash = ''; }
  ]) {
    const tampered = clone(incident);
    modify(tampered.hypotheses[0]!);
    assert.throws(() => loadCase(tampered), /Invalid persisted hypothesis/);
  }
});
test('Malformed nested untrusted verification fails closed without execution', () => {
  const c = createCase();
  for (const invalid of [
    { ...proposeHypothesis('An asserted cause without supporting controlled checks.'), state: 'CONFIRMED' },
    { ...proposeHypothesis('A second asserted cause without reproducible evidence.'), verification: { status: 'CONFIRMED' } },
    { ...result(), verification: { ...result().verification!, evidenceIds: 'not-an-array' } },
    { ...result(), verification: { ...result().verification!, repeatedCurrentFailures: Infinity } },
    { ...result(), verification: { ...result().verification!, baseline: { __proto__: null } } }
  ]) assert.throws(() => loadCase({ ...c, hypotheses: [invalid] }));
});
test('Timeouts, flaky and pre-existing checks never classify as introduced regression', () => {
  assert.equal(compareCheckOutcomes('CHECK_PASSED', 'CHECK_FAILED', true), 'INTRODUCED_OBSERVATION');
  assert.equal(compareCheckOutcomes('CHECK_FAILED', 'CHECK_FAILED', true), 'PRE_EXISTING_OBSERVATION');
  assert.equal(compareCheckOutcomes('CHECK_FAILED', 'CHECK_PASSED', true), 'ABSENT_OBSERVATION');
  for (const result of ['TIMEOUT','FLAKY','INCONCLUSIVE'] as const) {
    assert.equal(compareCheckOutcomes('CHECK_PASSED',result,true),'INCONCLUSIVE');
    assert.equal(compareCheckOutcomes(result,'CHECK_FAILED',true),'INCONCLUSIVE');
  }
  assert.equal(compareCheckOutcomes('CHECK_PASSED','CHECK_FAILED',false),'NOT_COMPARABLE');
});
test('Failed, timed-out or flaky check outcomes cannot be elevated to CONFIRMED', () => {
  const h = proposeHypothesis('Intervention associated with a specific failing behavior.');
  const input = { assertion:'A controlled intervention changes the tested behavior.',testId:'t',evidenceIds:['e'],
    baseline:fp,current:{...fp,id:'after',versionHash:'v2'},baselinePassed:true,currentFailed:true,
    causalIntervention:true,controlledEnvironment:true,repeatedCurrentFailures:2 };
  for(const state of ['TIMEOUT','FLAKY','INCONCLUSIVE','CHECK_FAILED'] as const)
    assert.equal(evaluateVerification(h,{...input,baselineOutcome:state}).state,'INCONCLUSIVE');
  for(const state of ['TIMEOUT','FLAKY','INCONCLUSIVE','CHECK_PASSED'] as const)
    assert.equal(evaluateVerification(h,{...input,currentOutcome:state}).state,'INCONCLUSIVE');
});
