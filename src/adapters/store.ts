import * as vscode from 'vscode';
import { randomUUID } from 'node:crypto';
import { loadCase } from '../core/case';
import { redactIncident } from '../core/redact';
import type { IncidentCase } from '../core/types';
const MAX_CASE_BYTES = 8 * 1024 * 1024;
const MAX_CASES = 20;
const CASE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class CaseStore {
  constructor(private readonly root: vscode.Uri) {}
  private location(id: string): vscode.Uri {
    if (!CASE_ID.test(id)) throw new Error('Invalid case ID.');
    return vscode.Uri.joinPath(this.root, 'case-' + id + '.json');
  }
  async list(): Promise<Array<{ id: string; title: string; updatedAt: string; archived: boolean }>> {
    try {
      const files = await vscode.workspace.fs.readDirectory(this.root);
      const list: Array<{ id: string; title: string; updatedAt: string; archived: boolean }> = [];
      for (const [name, type] of files.slice(0, 100)) {
        const m = /^case-([a-f0-9-]{36})\.json$/i.exec(name);
        if (!m?.[1] || type !== vscode.FileType.File) continue;
        try {
          const c = await this.read(m[1]);
          list.push({ id: c.id, title: c.title, updatedAt: c.updatedAt, archived: c.archived });
        } catch { /* Invalid/corrupt files are not deleted automatically. */ }
      }
      return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, MAX_CASES);
    } catch (error) {
      if (error instanceof vscode.FileSystemError && error.code === 'FileNotFound') return [];
      throw error;
    }
  }
  async read(id: string): Promise<IncidentCase> {
    const data = await vscode.workspace.fs.readFile(this.location(id));
    if (data.byteLength > MAX_CASE_BYTES) throw new Error('Case storage size budget exceeded.');
    const incident = loadCase(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data)) as unknown);
    if (incident.id !== id) throw new Error('Stored case identity does not match the selected file.');
    return incident;
  }
  async save(incident: IncidentCase): Promise<void> {
    if (!CASE_ID.test(incident.id)) throw new Error('Invalid case identifier.');
    const all = await this.list();
    if (!all.some(c => c.id === incident.id) && all.length >= MAX_CASES) throw new Error('Case count limit (20) reached; delete an old case first.');
    const safe = redactIncident(incident);
    const bytes = new TextEncoder().encode(JSON.stringify(safe));
    if (bytes.byteLength > MAX_CASE_BYTES) throw new Error('Case exceeds the 8 MiB persistence budget.');
    await vscode.workspace.fs.createDirectory(this.root);
    const target = this.location(incident.id);
    const temporary = vscode.Uri.joinPath(this.root, '.tmp-' + randomUUID() + '.json');
    try {
      await vscode.workspace.fs.writeFile(temporary, bytes);
      await vscode.workspace.fs.rename(temporary, target, { overwrite: true });
    } finally {
      try { await vscode.workspace.fs.delete(temporary); } catch { /* already renamed or failed; preserve original error */ }
    }
  }
  async delete(id: string): Promise<void> {
    await vscode.workspace.fs.delete(this.location(id), { useTrash: false });
  }
  async exportToWorkspaceFile(incident: IncidentCase): Promise<vscode.Uri | null> {
    const uri = await vscode.window.showSaveDialog({ saveLabel: 'Export redacted case',
      defaultUri: vscode.Uri.file('vestigivo-' + incident.id + '.json'), filters: { JSON: ['json'] } });
    if (!uri) return null;
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(JSON.stringify(redactIncident(incident), null, 2)));
    return uri;
  }
}
/** Stable IDs are assigned by core; the unused UUID is intentionally not used for paths. */
export const isCaseId = (id: string): boolean => CASE_ID.test(id);
