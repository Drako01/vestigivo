import { createHash } from 'node:crypto';
import type { Correlation, Observation } from './types';
const fingerprint = (value: string): string => createHash('sha256').update(value).digest('hex').slice(0, 24);
/** Exact identifiers only; never infer a causal relationship from proximity. */
export function correlate(observations: readonly Observation[]): Correlation[] {
  const groups = new Map<string, Set<string>>();
  for (const o of observations) {
    if (o.traceId) add(groups, 'trace:' + o.traceId, o.id);
    if (o.requestId) add(groups, 'request:' + o.requestId, o.id);
  }
  const results: Correlation[] = [];
  for (const [tag, memberIds] of groups) {
    if (memberIds.size < 2) continue;
    const isTrace = tag.startsWith('trace:');
    const key = tag.slice(isTrace ? 6 : 8);
    const observationIds = [...memberIds].sort();
    results.push({
      id: fingerprint(tag + ':' + observationIds.join('|')),
      state: 'CORRELATED',
      method: isTrace ? 'exact-trace-id' : 'exact-request-id',
      key,
      observationIds,
      explanation: isTrace
        ? 'Shared traceId exactly; indicates related trace context, not a proven cause.'
        : 'Shared requestId exactly; indicates related request context, not a proven cause.'
    });
  }
  return results.sort((a, b) => a.method.localeCompare(b.method) || a.key.localeCompare(b.key));
}
function add(groups: Map<string, Set<string>>, key: string, id: string): void {
  if (!groups.has(key)) groups.set(key, new Set());
  groups.get(key)?.add(id);
}
export function timeline(observations: readonly Observation[]): Observation[] {
  return [...observations].sort((a, b) => {
    if (!a.timestamp && b.timestamp) return 1;
    if (a.timestamp && !b.timestamp) return -1;
    const ordered = (a.timestamp ?? '').localeCompare(b.timestamp ?? '');
    return ordered || a.provenance.sourceId.localeCompare(b.provenance.sourceId) ||
      a.provenance.ordinal - b.provenance.ordinal || a.id.localeCompare(b.id);
  });
}
export interface TraceNode {
  observation: Observation;
  parentId: string | null;
  missingParent: boolean;
  ambiguousParent: boolean;
  cycleDetected: boolean;
}
/** Exact trace-scoped span tree. A repeated span ID is ambiguous, not a valid edge. */
export function traceTree(observations: readonly Observation[]): TraceNode[] {
  const spans = timeline(observations).filter(o => o.traceId && o.spanId);
  const grouped = new Map<string, Observation[]>();
  const key = (trace: string, span: string): string => trace + '\u0000' + span;
  for (const o of spans) {
    const k = key(o.traceId!, o.spanId!);
    const bucket = grouped.get(k) ?? [];
    bucket.push(o);
    grouped.set(k, bucket);
  }
  type Flags = Pick<TraceNode, 'missingParent' | 'ambiguousParent' | 'cycleDetected'>;
  const clean: Flags = { missingParent: false, ambiguousParent: false, cycleDetected: false };
  const memo = new Map<string, Flags>();
  const inspect = (start: Observation): Flags => {
    const visited = new Set<string>();
    const path: string[] = [];
    let cursor = start;
    let flags = clean;
    for (;;) {
      const currentKey = key(cursor.traceId!, cursor.spanId!);
      if (visited.has(currentKey)) { flags = { ...clean, cycleDetected: true }; break; }
      const cached = memo.get(currentKey);
      if (cached) { flags = cached; break; }
      visited.add(currentKey);
      path.push(currentKey);
      if (!cursor.parentSpanId) break;
      const parents = grouped.get(key(cursor.traceId!, cursor.parentSpanId)) ?? [];
      if (parents.length === 0) { flags = { ...clean, missingParent: true }; break; }
      if (parents.length !== 1) { flags = { ...clean, ambiguousParent: true }; break; }
      cursor = parents[0]!;
    }
    // Memoize only unique span IDs: duplicated IDs can have different parents.
    for (const k of path) if (grouped.get(k)?.length === 1) memo.set(k, flags);
    return flags;
  };
  return spans.map(observation => ({
    observation,
    parentId: observation.parentSpanId ?? null,
    ...inspect(observation)
  }));
}
