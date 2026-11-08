import { randomUUID } from 'node:crypto';
import { correlate } from './correlate';
import { redactText, redactIncident } from './redact';
import { SCHEMA_VERSION, type IncidentCase, type ImportResult, type Observation, type InvestigatorNote } from './types';

export function createCase(title = 'Untitled investigation', now = new Date().toISOString()): IncidentCase {
  return {
    schemaVersion: SCHEMA_VERSION, id: randomUUID(), title: redactText(title).slice(0, 180), createdAt: now,
    updatedAt: now, archived: false, sources: [], observations: [], correlations: [],
    hypotheses: [], notes: [], audit: [{ at: now, action: 'case-created', detail: 'New ephemeral case.' }],
    limitations: ['Correlation does not imply causality.', 'Secrets and personal information are redacted on a best-effort basis.']
  };
}
export function importIntoCase(existing: IncidentCase, added: ImportResult, now = new Date().toISOString()): IncidentCase {
  const old = new Map<string, Observation>(existing.observations.map(o => [o.id, o]));
  let excluded = 0;
  for (const item of added.observations) {
    if (old.has(item.id) || old.size < 10000) old.set(item.id, item);
    else excluded++;
  }
  const sources = [...existing.sources.filter(s => s.id !== added.source.id), added.source];
  const observations = [...old.values()];
  return {
    ...existing, sources, observations, correlations: correlate(observations), updatedAt: now,
    audit: [...existing.audit, { at: now, action: 'evidence-imported', detail: added.source.name + ' (' + added.status + ')' }].slice(-500),
    limitations: [...new Set([...existing.limitations, ...added.issues,
      ...(excluded ? ['Case observation budget (10,000) reached: ' + excluded + ' records excluded, not silently accepted.'] : [])])].slice(0, 100)
  };
}
export function addNote(existing: IncidentCase, text: string, now = new Date().toISOString()): IncidentCase {
  if (!text.trim() || text.length > 2000) throw new Error('Notes must be 1–2000 characters.');
  const note: InvestigatorNote = { id: randomUUID(), at: now, text: redactText(text) };
  return { ...existing, notes: [...existing.notes, note].slice(-200), updatedAt: now,
    audit: [...existing.audit, { at: now, action: 'note-added', detail: note.id }].slice(-500) };
}
export function duplicateCase(existing: IncidentCase, now = new Date().toISOString()): IncidentCase {
  return { ...existing, id: randomUUID(), title: existing.title + ' (copy)', createdAt: now, updatedAt: now,
    audit: [{ at: now, action: 'case-duplicated', detail: existing.id }] };
}
/** Accept only the known schema versions; every persisted boundary is untrusted. */
export function loadCase(input: unknown): IncidentCase {
  const object = (v: unknown): Record<string, unknown> | null =>
    v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : null;
  const validText = (value: unknown, max: number): value is string =>
    typeof value === 'string' && value.length <= max;
  const record = object(input);
  if (!record) throw new Error('Invalid case document.');
  const version = record.schemaVersion;
  if (version !== 0 && version !== SCHEMA_VERSION) throw new Error('Unsupported case schema version; no implicit downgrade.');
  if (!validText(record.id, 36) || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(record.id) ||
      !validText(record.title, 180) || !validText(record.createdAt, 64) ||
      !validText(record.updatedAt, 64)) throw new Error('Invalid case identity or metadata.');
  const sources = record.sources, observations = record.observations, hypotheses = record.hypotheses,
    audit = record.audit, limitations = record.limitations;
  if (!Array.isArray(sources) || sources.length > 100 ||
      !Array.isArray(observations) || observations.length > 10000 ||
      !Array.isArray(hypotheses) || hypotheses.length > 200 ||
      !Array.isArray(audit) || audit.length > 500 ||
      !Array.isArray(limitations) || limitations.length > 100 ||
      !limitations.every(v => validText(v, 2000))) throw new Error('Case exceeds safety budgets or contains invalid collections.');
  const notes = Array.isArray(record.notes) ? record.notes : (version === 0 ? [] : null);
  if (!notes || notes.length > 200) throw new Error('Invalid investigator notes.');
  if (version === 1 && typeof record.archived !== 'boolean') throw new Error('Invalid archived flag.');
  for (const value of sources) {
    const s = object(value);
    if (!s || !validText(s.id, 64) || !validText(s.name, 200) ||
        !validText(s.sha256, 64) || !/^[a-f0-9]{64}$/.test(s.sha256) ||
        !validText(s.format, 16) || !['json', 'jsonl', 'otlp-json'].includes(s.format) ||
        !validText(s.importedAt, 64) ||
        !Number.isSafeInteger(s.byteLength) || Number(s.byteLength) < 0)
      throw new Error('Invalid evidence source.');
  }
  for (const value of observations) {
    const o = object(value), p = object(o?.provenance);
    if (!o || !validText(o.id, 24) || !/^[a-f0-9]{24}$/.test(o.id) ||
        o.state !== 'OBSERVED' ||
        (o.schemaVersion !== SCHEMA_VERSION && !(version === 0 && o.schemaVersion === 0)) ||
        !validText(o.message, 16000) ||
        !(o.service === null || validText(o.service, 512)) ||
        !(o.timestamp === null || validText(o.timestamp, 64)) ||
        !['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'UNKNOWN'].includes(String(o.severity)) ||
        !object(o.attributes) || !p || !validText(p.sourceId, 64) ||
        !validText(p.importId, 64) || !Number.isSafeInteger(p.ordinal) || Number(p.ordinal) < 0)
      throw new Error('Invalid observation: persisted evidence is untrusted.');
    for (const key of ['traceId', 'spanId', 'parentSpanId', 'requestId', 'timestampNanoseconds']) {
      if (o[key] !== undefined && !validText(o[key], 512)) throw new Error('Invalid evidence identifier.');
    }
  }
  for (const value of hypotheses) {
    const h = object(value);
    if (!h || !validText(h.id, 64) || !validText(h.statement, 1000) ||
      !['HYPOTHESIS','CONFIRMED','INCONCLUSIVE'].includes(String(h.state)) ||
      !Array.isArray(h.supports) || !h.supports.every(v => validText(v, 256)) ||
      !Array.isArray(h.contradicts) || !h.contradicts.every(v => validText(v, 256)) ||
      !(h.verification === null || object(h.verification))) throw new Error('Invalid persisted hypothesis.');
  }
  for (const value of notes) {
    const n = object(value);
    if (!n || !validText(n.id, 64) || !validText(n.at, 64) || !validText(n.text, 2000))
      throw new Error('Invalid persisted investigator note.');
  }
  for (const value of audit) {
    const a = object(value);
    if (!a || !validText(a.at, 64) || !validText(a.action, 128) || !validText(a.detail, 2000))
      throw new Error('Invalid audit entry.');
  }
  const normalized = {
    ...record,
    schemaVersion: SCHEMA_VERSION,
    archived: version === 0 ? (record.archived === true) : record.archived,
    notes,
    observations: observations.map(o => ({ ...(o as Record<string, unknown>), schemaVersion: SCHEMA_VERSION })),
    correlations: []
  } as unknown as IncidentCase;
  const redacted = redactIncident(normalized);
  return { ...redacted, correlations: correlate(redacted.observations) };
}
export type Comparison = { persistent: string[]; added: string[]; absent: string[]; note: string };
export function compareCases(baseline: IncidentCase, current: IncidentCase): Comparison {
  const a = new Set(baseline.observations.map(o => o.id));
  const b = new Set(current.observations.map(o => o.id));
  return { persistent: [...a].filter(id => b.has(id)), added: [...b].filter(id => !a.has(id)),
    absent: [...a].filter(id => !b.has(id)),
    note: 'Absence in selected evidence is not proof that a defect was resolved.' };
}
