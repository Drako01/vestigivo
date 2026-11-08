import { randomUUID } from 'node:crypto';
import type { EnvironmentFingerprint, Hypothesis, VerificationResult } from './types';
export function proposeHypothesis(statement: string, supports: string[] = [], contradicts: string[] = []): Hypothesis {
  const clean = statement.trim();
  if (clean.length < 10 || clean.length > 1000) throw new Error('Hypothesis must be 10–1000 characters.');
  return { id: randomUUID(), statement: clean, supports: [...new Set(supports)], contradicts: [...new Set(contradicts)], state: 'HYPOTHESIS', verification: null };
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
