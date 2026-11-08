import type { IncidentCase } from './types';
import { redactText, redactIncident } from './redact';
import { timeline } from './correlate';
const md = (value: unknown): string => redactText(String(value ?? '')).replace(/[\\`*_{}\[\]()#+!|>]/g, '\\$&').replace(/\r?\n/g, ' ');
/** Deterministic, redacted export of existing case facts; no invented RCA claim. */
export function exportMarkdown(input: IncidentCase): string {
  const c = redactIncident(input);
  const lines: string[] = [
    '# Vestigivo RCA — ' + md(c.title), '',
    'Case: ' + md(c.id), 'Schema: ' + c.schemaVersion, 'Created: ' + md(c.createdAt), '',
    '## Evidence sources', '',
    ...c.sources.map(s => '- ' + md(s.name) + ' — SHA-256 ' + md(s.sha256) + ', bytes ' + s.byteLength),
    '', '## Observed timeline', '',
    ...timeline(c.observations).map(o => '- ' + md(o.timestamp ?? 'Time unknown') + ' | ' +
      md(o.severity) + ' | ' + md(o.service ?? 'Unknown service') + ' | ' + md(o.message) +
      ' | source ' + md(o.provenance.sourceId) + ' #' + o.provenance.ordinal),
    '', '## Correlations (NOT causal proof)', '',
    ...c.correlations.map(x => '- ' + md(x.method) + ': ' + md(x.key) + ' — ' +
      x.observationIds.length + ' records. ' + md(x.explanation)),
    '', '## Hypotheses and verification', '',
    ...c.hypotheses.map(h => '- ' + md(h.state) + ': ' + md(h.statement) +
      (h.verification ? ' — ' + md(h.verification.explanation) : ' — not verified')),
    '', '## Limitations', '',
    ...c.limitations.map(value => '- ' + md(value)),
    '', 'No automated root cause determination. Redaction is best-effort.', ''
  ];
  const content = lines.join('\n');
  if (content.length > 2_000_000) throw new Error('Markdown report exceeds the 2,000,000-character export limit; use redacted JSON instead. No partial report was written.');
  return content;
}
export function exportJson(input: IncidentCase): string {
  return JSON.stringify({ exportSchemaVersion: 1, application: 'Vestigivo RCA',
    warning: 'No automatic causal attribution. Best-effort redaction.',
    case: redactIncident(input) }, null, 2) + '\n';
}
