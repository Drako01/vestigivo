import { createHash } from 'node:crypto';
import { basename } from 'node:path';
import { redactText, sanitizeRecord } from './redact';
import { SCHEMA_VERSION, type EvidenceSource, type ImportResult, type Observation, type Severity, type Provenance } from './types';

type Obj = Record<string, unknown>;
export type ImportOptions = {
  maxBytes?: number;
  maxEvents?: number;
  maxLineLength?: number;
  maxDepth?: number;
  importedAt?: string;
};
export class EvidenceFormatError extends Error {
  constructor(readonly code: 'EMPTY' | 'SIZE_LIMIT' | 'UTF8_INVALID' | 'FORMAT' | 'DEPTH_LIMIT' | 'UNSUPPORTED', message: string) {
    super(message); this.name = 'EvidenceFormatError';
  }
}
const hash = (data: string | Uint8Array): string => createHash('sha256').update(data).digest('hex');
const obj = (value: unknown): Obj | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Obj : null;
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const choose = (...values: unknown[]): string | undefined => values.map(str).find((value): value is string => value !== undefined);
const asString = (value: unknown): string | undefined =>
  str(value) ?? (typeof value === 'number' && Number.isFinite(value) ? String(value) : undefined);
function attributeValue(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[TRUNCATED DEPTH]';
  const v = obj(value);
  if (!v) return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : null;
  for (const name of ['stringValue', 'intValue', 'doubleValue', 'boolValue', 'bytesValue']) {
    if (name in v) return v[name];
  }
  if (obj(v.arrayValue)) return arr(obj(v.arrayValue)?.values).slice(0, 128).map(x => attributeValue(x, depth + 1));
  if (obj(v.kvlistValue)) return otlpAttributes(arr(obj(v.kvlistValue)?.values));
  return null;
}
function otlpAttributes(entries: unknown[]): Obj {
  const result: Obj = {};
  for (const entry of entries.slice(0, 128)) {
    const item = obj(entry);
    const key = str(item?.key);
    if (key) result[key] = attributeValue(item?.value);
  }
  return result;
}
function time(raw: unknown, nanoseconds: boolean): { iso: string | null; nanos?: string; issue?: string } {
  if (raw === undefined || raw === null || raw === '') return { iso: null };
  if (nanoseconds) {
    try {
      if (typeof raw !== 'string' && typeof raw !== 'number') throw Error('type');
      if (!/^\d{1,22}$/.test(String(raw))) throw Error('digits');
      const n = BigInt(String(raw));
      const ms = n / 1000000n;
      if (ms > 8640000000000000n) throw Error('range');
      const iso = new Date(Number(ms)).toISOString();
      return { iso, nanos: n.toString() };
    } catch { return { iso: null, issue: 'Invalid OTLP nanosecond timestamp; no timestamp inferred.' }; }
  }
  if (typeof raw !== 'string' || !/^\d{4}-\d\d-\d\d[Tt ]/.test(raw)) return { iso: null, issue: 'Invalid or ambiguous timestamp; time is unknown.' };
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? { iso: new Date(ms).toISOString() } : { iso: null, issue: 'Invalid ISO timestamp; time is unknown.' };
}
function depthCheck(text: string, max: number): void {
  let depth = 0, inString = false, escaped = false;
  for (const c of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === '{' || c === '[') {
      if (++depth > max) throw new EvidenceFormatError('DEPTH_LIMIT', 'JSON nesting depth exceeded (' + max + ').');
    } else if (c === '}' || c === ']') depth--;
  }
}
function readBudget(value: number | undefined, fallback: number, ceiling: number, name: string): number {
  const n = value ?? fallback;
  if (!Number.isInteger(n) || n < 1 || n > ceiling) throw new EvidenceFormatError('SIZE_LIMIT', 'Invalid ' + name + ' budget.');
  return n;
}
type Context = { resource?: Obj; scope?: Obj };
/** Parses developer-selected UTF-8 JSON/JSONL/OTLP JSON; never executes data or follows links. */
export function parseEvidence(bytes: Uint8Array, fileName: string, options: ImportOptions = {}): ImportResult {
  const maxBytes = readBudget(options.maxBytes, 8 * 1024 * 1024, 32 * 1024 * 1024, 'maxBytes');
  const maxEvents = readBudget(options.maxEvents, 10000, 100000, 'maxEvents');
  const maxLineLength = readBudget(options.maxLineLength, 65536, 1024 * 1024, 'maxLineLength');
  const maxDepth = readBudget(options.maxDepth, 40, 128, 'maxDepth');
  if (!bytes.byteLength) throw new EvidenceFormatError('EMPTY', 'Selected evidence file is empty.');
  if (bytes.byteLength > maxBytes) throw new EvidenceFormatError('SIZE_LIMIT', 'File exceeds the ' + maxBytes + '-byte import budget.');
  const safeName = redactText(basename(fileName)).slice(0, 200);
  const jsonl = /\.(jsonl|ndjson|log)$/i.test(fileName);
  if (!jsonl && !/\.json$/i.test(fileName)) throw new EvidenceFormatError('UNSUPPORTED', 'Supported formats: .json, .jsonl, .ndjson, structured .log.');
  let sourceText: string;
  try { sourceText = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''); }
  catch { throw new EvidenceFormatError('UTF8_INVALID', 'Evidence must be valid UTF-8.'); }
  if (!sourceText.trim()) throw new EvidenceFormatError('EMPTY', 'Selected file contains no JSON evidence.');
  const sha256 = hash(bytes);
  const id = sha256.slice(0, 24);
  const source: EvidenceSource = { id, name: safeName, sha256, byteLength: bytes.byteLength, format: jsonl ? 'jsonl' : 'json', importedAt: options.importedAt ?? new Date().toISOString() };
  const observations: Observation[] = [];
  const issues: string[] = [];
  let exhausted = false;
  let ordinal = 0;
  const ingest = (entry: unknown, context: Context = {}, line?: number): void => {
    if (observations.length >= maxEvents) { exhausted = true; return; }
    const record = obj(entry);
    if (!record) { issues.push('Skipped non-object evidence record' + (line ? ' at line ' + line : '') + '.'); return; }
    const attributes = Array.isArray(record.attributes) ? otlpAttributes(record.attributes) : (obj(record.attributes) ?? {});
    const resourceAttributes = context.resource && Array.isArray(context.resource.attributes) ? otlpAttributes(context.resource.attributes) : {};
    const mergedAttributes = sanitizeRecord({ ...resourceAttributes, ...attributes });
    const rawTime = record.timeUnixNano ?? record.startTimeUnixNano ?? record.timestamp ?? record.time;
    const t = time(rawTime, record.timeUnixNano !== undefined || record.startTimeUnixNano !== undefined);
    if (t.issue) issues.push('Observation ' + (ordinal + 1) + ': ' + t.issue);
    const rawSeverity = choose(record.severityText, record.severity, record.level) ?? 'UNKNOWN';
    const severity = /^(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)$/i.test(rawSeverity) ? rawSeverity.toUpperCase() as Severity : 'UNKNOWN';
    const body = obj(record.body);
    const service = choose(record.service, record.serviceName, mergedAttributes['service.name'], resourceAttributes['service.name']);
    const traceId = choose(record.traceId, record.trace_id);
    const spanId = choose(record.spanId, record.span_id);
    const parentSpanId = choose(record.parentSpanId, record.parent_span_id);
    const requestId = choose(record.requestId, record.request_id, mergedAttributes['request.id'], mergedAttributes['http.request_id']);
    const msg = choose(record.message, record.name, record.exception, body?.stringValue, record.body,
      record.msg, record.event, record.description) ?? '[No message in evidence]';
    const provenance: Provenance = {
      sourceId: id, importId: id, ordinal,
      ...(line !== undefined ? { line } : {}),
      ...(rawTime !== undefined ? { rawTimestamp: redactText(String(rawTime)) } : {})
    };
    observations.push({
      schemaVersion: SCHEMA_VERSION,
      id: hash(sha256 + ':' + ordinal).slice(0, 24),
      state: 'OBSERVED',
      timestamp: t.iso, ...(t.nanos ? { timestampNanoseconds: t.nanos } : {}),
      service: service ? redactText(service) : null,
      severity, message: redactText(msg),
      ...(traceId ? { traceId: redactText(traceId) } : {}),
      ...(spanId ? { spanId: redactText(spanId) } : {}),
      ...(parentSpanId ? { parentSpanId: redactText(parentSpanId) } : {}),
      ...(requestId ? { requestId: redactText(requestId) } : {}),
      attributes: mergedAttributes, provenance
    });
    ordinal++;
  };
  const otlp = (root: Obj): boolean => {
    if (!Array.isArray(root.resourceSpans) && !Array.isArray(root.resourceLogs)) return false;
    source.format = 'otlp-json';
    for (const rs of arr(root.resourceSpans)) {
      const group = obj(rs);
      for (const scope of arr(group?.scopeSpans)) {
        const section = obj(scope);
        for (const span of arr(section?.spans)) {
          ingest(span, { resource: obj(group?.resource) ?? undefined, scope: obj(section?.scope) ?? undefined });
          const spanObj = obj(span);
          for (const event of arr(spanObj?.events)) {
            const ev = obj(event);
            if (ev) ingest({ ...ev, traceId: spanObj?.traceId, spanId: spanObj?.spanId, parentSpanId: spanObj?.parentSpanId, severityText: 'INFO' },
              { resource: obj(group?.resource) ?? undefined, scope: obj(section?.scope) ?? undefined });
          }
          if (exhausted) break;
        }
        if (exhausted) break;
      }
      if (exhausted) break;
    }
    for (const rl of arr(root.resourceLogs)) {
      const group = obj(rl);
      for (const scope of arr(group?.scopeLogs)) {
        const section = obj(scope);
        for (const log of arr(section?.logRecords)) {
          ingest(log, { resource: obj(group?.resource) ?? undefined, scope: obj(section?.scope) ?? undefined });
          if (exhausted) break;
        }
        if (exhausted) break;
      }
      if (exhausted) break;
    }
    return true;
  };
  if (jsonl) {
    const lines = sourceText.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      if (!line.trim()) continue;
      if (line.length > maxLineLength) { issues.push('Line ' + (i + 1) + ' exceeds maximum length; skipped.'); continue; }
      try {
        depthCheck(line, maxDepth);
        const v: unknown = JSON.parse(line);
        const root = obj(v);
        if (!root || !otlp(root)) ingest(v, {}, i + 1);
      } catch (error) {
        if (error instanceof EvidenceFormatError && error.code === 'DEPTH_LIMIT') throw error;
        issues.push('Line ' + (i + 1) + ': invalid JSON; skipped.');
      }
      if (exhausted) break;
    }
  } else {
    depthCheck(sourceText, maxDepth);
    let root: unknown;
    try { root = JSON.parse(sourceText) as unknown; }
    catch { throw new EvidenceFormatError('FORMAT', 'Invalid JSON document.'); }
    const data = obj(root);
    if (data && otlp(data)) { /* normalized OTLP */ }
    else if (Array.isArray(root)) { for (const item of root) { ingest(item); if (exhausted) break; } }
    else if (data && (Array.isArray(data.events) || Array.isArray(data.logs))) {
      for (const item of arr(data.events ?? data.logs)) { ingest(item); if (exhausted) break; }
    } else if (data && ['message', 'msg', 'body', 'timestamp', 'time', 'traceId'].some(k => k in data)) ingest(data);
    else throw new EvidenceFormatError('UNSUPPORTED', 'JSON shape is unsupported: expected events/logs, an array, a record, or OTLP JSON.');
  }
  if (exhausted) issues.push('Event budget reached (' + maxEvents + '); evidence was truncated.');
  if (observations.length === 0) {
    throw new EvidenceFormatError('FORMAT', 'No supported observations in selected file. ' + issues.slice(0, 2).join(' '));
  }
  return { source, observations, status: issues.length ? 'PARTIAL' : 'COMPLETE', issues: issues.slice(0, 50) };
}
