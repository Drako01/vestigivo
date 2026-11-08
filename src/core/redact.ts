/** Best-effort redaction. Never promise all PII or secrets can be detected. */
const SENSITIVE_KEY = /(password|passwd|passphrase|authorization|cookie|secret|private.?key|access.?token|refresh.?token|api.?key|credential|client.?secret|session.?id)/i;
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ANSI = /\u001b\[[0-?]*[ -/]*[@-~]/g;
const BEARER = /\b(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi;
const ASSIGNMENT = /\b((?:password|passwd|api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token)\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s&,;]+)/gi;
const URL_SECRET = /([?&](?:access_token|token|api_key|key|secret|password)=)[^&#\s]+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\b/g;
const BASIC = /\b(Authorization\s*[:=]\s*(?:Basic|Bearer|Token)\s+)[A-Za-z0-9._~+/=-]{4,}/gi;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
export function redactText(input: string): string {
  return input.replace(ANSI, '').replace(CONTROL, '')
    .replace(BASIC, '$1[REDACTED]')
    .replace(BEARER, '$1[REDACTED]')
    .replace(ASSIGNMENT, '$1[REDACTED]')
    .replace(URL_SECRET, '$1[REDACTED]')
    .replace(JWT, '[REDACTED JWT]')
    .replace(EMAIL, '[REDACTED EMAIL]').slice(0, 16000);
}
/** Sanitize parsed JSON recursively, with cardinality and depth limits. */
export function redactValue(input: unknown, depth = 0): unknown {
  if (depth >= 16) return '[TRUNCATED DEPTH]';
  if (typeof input === 'string') return redactText(input);
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (typeof input === 'boolean' || input === null) return input;
  if (Array.isArray(input)) return input.slice(0, 128).map(x => redactValue(x, depth + 1));
  if (typeof input === 'object') {
    const out: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const [key, value] of Object.entries(input).slice(0, 128)) {
      const cleanedKey = redactText(key).slice(0, 120);
      out[cleanedKey] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactValue(value, depth + 1);
    }
    return out;
  }
  return null;
}
export function sanitizeRecord(input: unknown): Record<string, unknown> {
  const output = redactValue(input);
  return output !== null && typeof output === 'object' && !Array.isArray(output)
    ? output as Record<string, unknown> : {};
}

/** Redacts a complete incident without silently cutting observation arrays to 128 entries. */
export function redactIncident<T extends import('./types').IncidentCase>(incident: T): T {
  return {
    ...incident,
    title: redactText(incident.title),
    sources: incident.sources.map(source => redactValue(source) as typeof source),
    observations: incident.observations.map(observation => redactValue(observation) as typeof observation),
    correlations: incident.correlations.map(correlation => ({ ...correlation,
      key: redactText(correlation.key), explanation: redactText(correlation.explanation),
      observationIds: correlation.observationIds.map(redactText) })),
    hypotheses: incident.hypotheses.map(hypothesis => redactValue(hypothesis) as typeof hypothesis),
    notes: incident.notes.map(note => redactValue(note) as typeof note),
    audit: incident.audit.map(entry => redactValue(entry) as typeof entry),
    limitations: incident.limitations.map(redactText)
  } as T;
}
