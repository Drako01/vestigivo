/** Versioned incident data. OBSERVED/CORRELATED never mean causality. */
export const SCHEMA_VERSION = 1 as const;
export type TruthState = 'OBSERVED' | 'CORRELATED' | 'HYPOTHESIS' | 'CONFIRMED' | 'INCONCLUSIVE';
export type Severity = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'UNKNOWN';
export interface Provenance {
  sourceId: string;
  importId: string;
  ordinal: number;
  line?: number;
  /** Source-local timestamp, if supplied. Null means unknown. */
  rawTimestamp?: string;
}
export interface EvidenceSource {
  id: string;
  /** File name only, never an implicit upload or URL. */
  name: string;
  sha256: string;
  byteLength: number;
  format: 'json' | 'jsonl' | 'otlp-json';
  importedAt: string;
}
export interface Observation {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  state: 'OBSERVED';
  timestamp: string | null;
  /** Preserve sub-millisecond precision without guessing clock accuracy. */
  timestampNanoseconds?: string;
  service: string | null;
  severity: Severity;
  message: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  requestId?: string;
  attributes: Record<string, unknown>;
  provenance: Provenance;
}
export interface Correlation {
  id: string;
  state: 'CORRELATED';
  method: 'exact-trace-id' | 'exact-request-id' | 'parent-span-id';
  key: string;
  observationIds: string[];
  explanation: string;
}
export interface EnvironmentFingerprint {
  id: string;
  testId: string;
  inputHash: string;
  configHash: string;
  environmentHash: string;
  versionHash: string;
}
export interface VerificationResult {
  id: string;
  hypothesisId: string;
  status: 'CONFIRMED' | 'INCONCLUSIVE';
  assertion: string;
  evidenceIds: string[];
  testId: string;
  baseline: EnvironmentFingerprint | null;
  current: EnvironmentFingerprint | null;
  baselinePassed: boolean;
  currentFailed: boolean;
  causalIntervention: boolean;
  controlledEnvironment: boolean;
  repeatedCurrentFailures: number;
  explanation: string;
}
/** A human-authored verification plan; never executed by Vestigivo. */
export interface VerificationPlan {
  id: string;
  hypothesisId: string;
  assertion: string;
  testId: string;
  preconditions: string;
  expectedOutcome: string;
  risks: string;
  cost: string;
  createdAt: string;
  status: 'PLANNED';
}
export interface Hypothesis {
  id: string;
  statement: string;
  state: 'HYPOTHESIS' | 'CONFIRMED' | 'INCONCLUSIVE';
  supports: string[];
  contradicts: string[];
  verification: VerificationResult | null;
  plan?: VerificationPlan | null;
}
export interface InvestigatorNote {
  id: string;
  at: string;
  text: string;
}
export interface CaseAuditEntry {
  at: string;
  action: string;
  detail: string;
}
export interface IncidentCase {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  sources: EvidenceSource[];
  observations: Observation[];
  correlations: Correlation[];
  hypotheses: Hypothesis[];
  notes: InvestigatorNote[];
  bookmarks?: string[];
  audit: CaseAuditEntry[];
  limitations: string[];
}
export interface ImportResult {
  source: EvidenceSource;
  observations: Observation[];
  status: 'COMPLETE' | 'PARTIAL';
  issues: string[];
}
