import * as vscode from 'vscode';
/** Constrained, opt-in, read-only providers. No user log bodies are ever submitted. */
export type ProviderName = 'sentry' | 'grafana';
export interface ProviderResponse { status: number; content: unknown; }
export class ProviderClient {
  constructor(private readonly secrets: vscode.SecretStorage) {}
  private key(name: ProviderName): string { return 'vestigivo.provider.' + name; }
  async connect(name: ProviderName, token: string): Promise<void> {
    if (token.length < 8 || token.length > 4096 || /\r|\n/.test(token)) throw Error('Invalid credential.');
    await this.secrets.store(this.key(name), token);
  }
  async disconnect(name: ProviderName): Promise<void> { await this.secrets.delete(this.key(name)); }
  async isConnected(name: ProviderName): Promise<boolean> { return !!(await this.secrets.get(this.key(name))); }
  /** Host allowlist intentionally excludes custom private Grafana hosts: no SSRF surface. */
  async get(name: ProviderName, resourceId: string, signal?: AbortSignal): Promise<ProviderResponse> {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(resourceId)) throw Error('Invalid resource identifier.');
    const token = await this.secrets.get(this.key(name));
    if (!token) throw Error('Provider is disconnected. Explicitly connect first.');
    const url = name === 'sentry'
      ? new URL('https://sentry.io/api/0/issues/' + encodeURIComponent(resourceId) + '/')
      : new URL('https://grafana.com/api/plugins/' + encodeURIComponent(resourceId));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const onAbort = (): void => controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await fetch(url, {
        method: 'GET', redirect: 'error', signal: controller.signal,
        headers: { Authorization: name === 'sentry' ? 'Bearer ' + token : 'Bearer ' + token, Accept: 'application/json' }
      });
      if (!response.ok) throw Error('Provider ' + name + ' returned HTTP ' + response.status);
      const length = Number(response.headers.get('content-length') ?? '0');
      if (length > 512 * 1024) throw Error('Provider response exceeds 512 KiB.');
      const body = await response.text();
      if (body.length > 512 * 1024) throw Error('Provider response exceeds budget.');
      return { status: response.status, content: JSON.parse(body) as unknown };
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}
