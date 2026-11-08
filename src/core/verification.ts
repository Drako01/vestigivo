import { randomUUID } from 'node:crypto';
import type { EnvironmentFingerprint, Hypothesis, VerificationResult } from './types';
export function proposeHypothesis(statement: string, supports: string[] = [], contradicts: string[] = []): Hypothesis {
  const clean = statement.trim();
  if (clean.length < 10 || clean.length > 1000) throw new Error('Hypothesis must be 10–1000 characters.');
  return { id: randomUUID(), statement: clean, supports: [...new Set(supports)], contradicts: [...new Set(contradicts)], state: 'HYPOTHESIS', verification: null };
}

/** Outcomes are observations, not conclusions about defect introduction or causality. */
export type CheckOutcome = 'CHECK_PASSED' | 'CHECK_FAILED' | 'TIMEOUT' | 'FLAKY' | 'INCONCLUSIVE';
export type ComparisonStatus = 'INTRODUCED_OBSERVATION' | 'PRE_EXISTING_OBSERVATION' | 'ABSENT_OBSERVATION' | 'NOT_COMPARABLE' | 'INCONCLUSIVE';
export function compareCheckOutcomes(
  baseline: CheckOutcome, current: CheckOutcome, comparable: boolean
): ComparisonStatus {
  if (!comparable) return 'NOT_COMPARABLE';
  if (baseline === 'TIMEOUT' || current === 'TIMEOUT' || baseline === 'FLAKY' ||
      current === 'FLAKY' || baseline === 'INCONCLUSIVE' || current === 'INCONCLUSIVE')
    return 'INCONCLUSIVE';
  if (baseline === 'CHECK_PASSED' && current === 'CHECK_FAILED') return 'INTRODUCED_OBSERVATION';
  if (baseline === 'CHECK_FAILED' && current === 'CHECK_FAILED') return 'PRE_EXISTING_OBSERVATION';
  if (baseline === 'CHECK_FAILED' && current === 'CHECK_PASSED') return 'ABSENT_OBSERVATION';
  return 'INCONCLUSIVE';
}
/** Validate an untrusted stored assertion without ever upgrading its confidence. */
export function validStoredHypothesis(input: unknown): boolean {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const h = input as Record<string, unknown>;
  const txt = (x: unknown, max: number): x is string =>
    typeof x === 'string' && x.length > 0 && x.length <= max;
  if (!txt(h.id, 64) || !txt(h.statement, 1000) ||
      !Array.isArray(h.supports) || h.supports.length > 200 ||
      !h.supports.every(x => txt(x, 256)) ||
      !Array.isArray(h.contradicts) || h.contradicts.length > 200 ||
      !h.contradicts.every(x => txt(x, 256))) return false;
  if (h.verification === null) return h.state === 'HYPOTHESIS';
  if (!h.verification || typeof h.verification !== 'object' || Array.isArray(h.verification)) return false;
  const v = h.verification as Record<string, unknown>;
  if (!txt(v.id, 64) || v.hypothesisId !== h.id ||
      (v.status !== 'CONFIRMED' && v.status !== 'INCONCLUSIVE') ||
      h.state !== v.status || !txt(v.assertion, 1000) || !txt(v.testId, 256) ||
      !txt(v.explanation, 2000) ||
      !Array.isArray(v.evidenceIds) || v.evidenceIds.length === 0 ||
      v.evidenceIds.length > 200 || !v.evidenceIds.every(x => txt(x, 256)) ||
      typeof v.baselinePassed !== 'boolean' || typeof v.currentFailed !== 'boolean' ||
      typeof v.causalIntervention !== 'boolean' || typeof v.controlledEnvironment !== 'boolean' ||
      !Number.isInteger(v.repeatedCurrentFailures) ||
      (v.repeatedCurrentFailures as number) < 0 || (v.repeatedCurrentFailures as number) > 10000)
    return false;
  const fingerprint = (value: unknown): value is import('./types').EnvironmentFingerprint => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const f = value as Record<string, unknown>;
    return ['id','testId','inputHash','configHash','environmentHash','versionHash']
      .every(key => txt(f[key], 256));
  };
  if (!(v.baseline === null || fingerprint(v.baseline)) ||
      !(v.current === null || fingerprint(v.current))) return false;
  if (v.status === 'CONFIRMED') {
    const b = v.baseline as import('./types').EnvironmentFingerprint | null;
    const c = v.current as import('./types').EnvironmentFingerprint | null;
    const comparable = !!b && !!c && b.testId === c.testId && b.testId === v.testId &&
      b.inputHash === c.inputHash && b.configHash === c.configHash &&
      b.environmentHash === c.environmentHash;
    if (!comparable || !v.baselinePassed || !v.currentFailed ||
        !v.causalIntervention || !v.controlledEnvironment ||
        (v.repeatedCurrentFailures as number) < 2 ||
        (v.assertion as string).trim().length < 10) return false;
  }
  return true;
}

export interface VerificationInput {
  assertion: string;
  testId: string;
  evidenceIds: string[];
  baseline: EnvironmentFingerprint | null;
  current: EnvironmentFingerprint | null;
  baselinePassed: boolean;
  currentFailed: boolean;
  causalIntervention: boolean;
  controlledEnvironment: boolean;
  repeatedCurrentFailures: number;
  baselineOutcome?: CheckOutcome;
  currentOutcome?: CheckOutcome;
}
/** No log correlation, LLM output, or reproduction alone can confirm RCA. */
export function evaluateVerification(hypothesis: Hypothesis, input: VerificationInput): Hypothesis {
  const comparable = !!input.baseline && !!input.current &&
    input.baseline.testId === input.current.testId && input.testId === input.baseline.testId &&
    input.baseline.inputHash === input.current.inputHash &&
    input.baseline.configHash === input.current.configHash &&
    input.baseline.environmentHash === input.current.environmentHash;
  const confirmed = comparable && input.baselinePassed && input.currentFailed &&
    input.causalIntervention && input.controlledEnvironment &&
    (input.baselineOutcome === undefined || input.baselineOutcome === 'CHECK_PASSED') &&
    (input.currentOutcome === undefined || input.currentOutcome === 'CHECK_FAILED') &&
    Number.isInteger(input.repeatedCurrentFailures) && input.repeatedCurrentFailures >= 2 &&
    input.assertion.trim().length >= 10 && input.evidenceIds.length > 0;
  const result: VerificationResult = {
    id: randomUUID(), hypothesisId: hypothesis.id,
    status: confirmed ? 'CONFIRMED' : 'INCONCLUSIVE',
    assertion: input.assertion.slice(0, 1000), evidenceIds: [...new Set(input.evidenceIds)],
    testId: input.testId,
    baseline: input.baseline, current: input.current,
    baselinePassed: input.baselinePassed, currentFailed: input.currentFailed,
    causalIntervention: input.causalIntervention, controlledEnvironment: input.controlledEnvironment,
    repeatedCurrentFailures: input.repeatedCurrentFailures,
    explanation: confirmed
      ? 'A narrowly scoped assertion meets the controlled and comparable reproduction gate; not a broader RCA claim.'
      : 'No confirmation: a comparable baseline, controlled intervention, multiple repetitions and explicit evidence are all required.'
  };
  return { ...hypothesis, state: result.status, verification: result };
}
