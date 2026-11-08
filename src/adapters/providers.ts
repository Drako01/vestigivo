import type * as vscode from 'vscode';
import { redactText } from '../core/redact';

/** Only official hosted endpoints; no arbitrary URLs, redirects or private DNS inputs. */
export type ProviderName = 'sentry' | 'grafana';
export type ProviderConnection = {
  endpoint: string;
  organization?: string;
  project?: string;
  namespace?: string;
};
export type ProviderEntry = {
  id: string;
  title: string;
  service: string | null;
  timestamp: string | null;
  kind: 'issue' | 'annotation';
};
export type ProviderResult = {
  provider: ProviderName;
  entries: ProviderEntry[];
  totalReturned: number;
  note: string;
};
const obj = (v: unknown): Record<string, unknown> | null =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : null;
const str = (v: unknown, max = 256): string =>
  typeof v === 'string' ? redactText(v).slice(0, max) : '';
const identifier = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
export function validateProviderConnection(name: ProviderName, connection: ProviderConnection): ProviderConnection {
  let uri: URL;
  try { uri = new URL(connection.endpoint); } catch { throw new Error('Invalid provider HTTPS origin.'); }
  if (uri.protocol !== 'https:' || uri.username || uri.password || uri.port && uri.port !== '443' ||
      uri.search || uri.hash || uri.pathname !== '/' || !uri.hostname)
    throw new Error('Provider URL must be a clean HTTPS origin without path, query, credentials or nonstandard port.');
  const host = uri.hostname.toLowerCase();
  if (name === 'sentry') {
    if (!['sentry.io','us.sentry.io','de.sentry.io'].includes(host))
      throw new Error('Sentry host is not on the explicit hosted allowlist.');
    if (!connection.organization || !identifier.test(connection.organization) ||
        connection.project && !identifier.test(connection.project))
      throw new Error('Sentry organization and optional project must be explicit slugs.');
    return { endpoint: 'https://' + host, organization: connection.organization,
      ...(connection.project ? { project: connection.project } : {}) };
  }
  if (name === 'grafana') {
    if (!/^[a-z0-9][a-z0-9-]{0,62}\.grafana\.net$/.test(host))
      throw new Error('Only official Grafana Cloud stack hosts are permitted (SSRF protection).');
    if (connection.namespace && !identifier.test(connection.namespace))
      throw new Error('Invalid Grafana namespace.');
    return { endpoint: 'https://' + host, namespace: connection.namespace ?? 'default' };
  }
  throw new Error('Unknown provider.');
}
type Credentials = { token: string; config: ProviderConnection };
export class ProviderClient {
  constructor(private readonly secrets: vscode.SecretStorage, private readonly transport: typeof fetch = fetch) {}
  private key(name: ProviderName): string { return 'vestigivo.provider.' + name; }
  async connect(name: ProviderName, token: string, config: ProviderConnection): Promise<void> {
    const safe = validateProviderConnection(name, config);
    if (token.trim().length < 8 || token.length > 4096 || /[\r\n]/.test(token))
      throw new Error('Provider token must be between 8 and 4096 characters with no newlines.');
    await this.secrets.store(this.key(name), JSON.stringify({ token, config: safe }));
  }
  async disconnect(name: ProviderName): Promise<void> { await this.secrets.delete(this.key(name)); }
  async connection(name: ProviderName): Promise<ProviderConnection | null> {
    const saved = await this.credentials(name);
    return saved?.config ?? null;
  }
  private async credentials(name: ProviderName): Promise<Credentials | null> {
    const stored = await this.secrets.get(this.key(name));
    if (!stored) return null;
    let decoded: unknown;
    try { decoded = JSON.parse(stored) as unknown; } catch { throw new Error('Corrupted provider credential; disconnect and reconnect.'); }
    const value = obj(decoded), config = obj(value?.config);
    if (typeof value?.token !== 'string' || !config || typeof config.endpoint !== 'string')
      throw new Error('Invalid provider credential record.');
    const raw: ProviderConnection = { endpoint: config.endpoint,
      ...(typeof config.organization === 'string' ? { organization: config.organization } : {}),
      ...(typeof config.project === 'string' ? { project: config.project } : {}),
      ...(typeof config.namespace === 'string' ? { namespace: config.namespace } : {}) };
    return { token: value.token, config: validateProviderConnection(name, raw) };
  }
  async list(name: ProviderName, query = '', signal?: AbortSignal): Promise<ProviderResult> {
    if (query.length > 180 || /[\u0000-\u001F]/.test(query)) throw new Error('Invalid search filter.');
    const credentials = await this.credentials(name);
    if (!credentials) throw new Error('Provider disconnected. Explicitly connect before reading.');
    const { token, config } = credentials;
    const url = name === 'sentry'
      ? new URL('/api/0/organizations/' + encodeURIComponent(config.organization ?? '') + '/issues/', config.endpoint)
      : new URL('/apis/annotation.grafana.app/v0alpha1/namespaces/' + encodeURIComponent(config.namespace ?? 'default') + '/annotations', config.endpoint);
    url.searchParams.set('limit', '25');
    if (name === 'sentry') {
      url.searchParams.set('query', query || 'is:unresolved');
      if (config.project) url.searchParams.set('project', config.project);
    }
    const raw = await this.readJson(url, token, signal);
    const entries: ProviderEntry[] = [];
    const itemList = name === 'sentry' ? raw : obj(raw)?.items;
    if (!Array.isArray(itemList)) throw new Error('Unexpected provider schema; no records inferred.');
    for (const item of itemList.slice(0, 25)) {
      const entry = obj(item);
      if (!entry) continue;
      if (name === 'sentry') {
        entries.push({ id: str(entry.id), title: str(entry.title, 600),
          service: str(obj(entry.project)?.slug) || null,
          timestamp: str(entry.lastSeen) || null, kind: 'issue' });
      } else {
        const metadata = obj(entry.metadata), spec = obj(entry.spec);
        const temporal = spec?.time;
        entries.push({ id: str(metadata?.name), title: str(spec?.text, 600),
          service: str(spec?.dashboardUID) || null,
          timestamp: typeof temporal === 'number' && Number.isFinite(temporal) ? new Date(temporal).toISOString() : null,
          kind: 'annotation' });
      }
    }
    return { provider: name, entries, totalReturned: entries.length,
      note: 'Read-only provider data; it is not a local observation or a causal attribution. No local file was uploaded.' };
  }
  private async readJson(url: URL, token: string, signal?: AbortSignal): Promise<unknown> {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 5000);
    const upstream = (): void => abort.abort();
    signal?.addEventListener('abort', upstream, { once: true });
    try {
      const response = await this.transport(url.href, {
        method: 'GET', redirect: 'error', signal: abort.signal,
        headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) throw new Error('Provider permissions denied (HTTP ' + response.status + ').');
        if (response.status === 404) throw new Error('Provider project, namespace or resource not found (HTTP 404).');
        if (response.status === 429) throw new Error('Provider rate limit reached (HTTP 429); retry later.');
        throw new Error('Provider read failed with HTTP ' + response.status + '.');
      }
      if (Number(response.headers.get('content-length') ?? '0') > 512 * 1024)
        throw new Error('Provider response exceeds 512 KiB.');
      if (!response.body) throw new Error('Provider returned no response body.');
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > 512 * 1024) throw new Error('Provider response exceeded 512 KiB budget.');
          chunks.push(chunk.value);
        }
      } finally { await reader.cancel().catch(() => undefined); }
      const combined = new Uint8Array(size);
      let at = 0; for (const chunk of chunks) { combined.set(chunk, at); at += chunk.length; }
      try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(combined)) as unknown; }
      catch { throw new Error('Provider response is not valid UTF-8 JSON.'); }
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', upstream);
    }
  }
}
