import { randomUUID } from 'node:crypto';
import { correlate } from './correlate';
import { redactText } from './redact';
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
  for (const item of added.observations) old.set(item.id, item);
  const sources = [...existing.sources.filter(s => s.id !== added.source.id), added.source];
  const observations = [...old.values()];
  return {
    ...existing, sources, observations, correlations: correlate(observations), updatedAt: now,
    audit: [...existing.audit, { at: now, action: 'evidence-imported', detail: added.source.name + ' (' + added.status + ')' }].slice(-500),
    limitations: [...new Set([...existing.limitations, ...added.issues])].slice(0, 100)
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
/** Schema migration: unknown or incompatible versions rejected, not silently downgraded. */
export function loadCase(input: unknown): IncidentCase {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid case document.');
  const raw = input as Record<string, unknown>;
  if (raw.schemaVersion !== SCHEMA_VERSION) throw new Error('Unsupported case schema version. Migration required.');
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string' || !Array.isArray(raw.observations) ||
      !Array.isArray(raw.sources) || !Array.isArray(raw.hypotheses) || !Array.isArray(raw.audit) ||
      !Array.isArray(raw.limitations)) throw new Error('Invalid or incomplete case document.');
  if (raw.observations.length > 10000 || raw.sources.length > 100 || raw.audit.length > 500) throw new Error('Case exceeds local storage budget.');
  const checked = raw as unknown as IncidentCase;
  return { ...checked, correlations: correlate(checked.observations),
    notes: Array.isArray(checked.notes) ? checked.notes : [] };
}
export type Comparison = { persistent: string[]; added: string[]; absent: string[]; note: string };
export function compareCases(baseline: IncidentCase, current: IncidentCase): Comparison {
  const a = new Set(baseline.observations.map(o => o.id));
  const b = new Set(current.observations.map(o => o.id));
  return { persistent: [...a].filter(id => b.has(id)), added: [...b].filter(id => !a.has(id)),
    absent: [...a].filter(id => !b.has(id)),
    note: 'Absence in selected evidence is not proof that a defect was resolved.' };
}
