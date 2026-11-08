import * as vscode from 'vscode';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createCase, importIntoCase, addNote, duplicateCase } from '../core/case';
import { parseEvidence, EvidenceFormatError } from '../core/parser';
import { exportMarkdown, exportJson } from '../core/report';
import { redactText } from '../core/redact';
import { proposeHypothesis } from '../core/verification';
import type { IncidentCase } from '../core/types';
import { readGitHistory, type GitSnapshot } from '../adapters/git';
import { CaseStore } from '../adapters/store';

type UiMessage = { type: 'import' | 'exportMarkdown' | 'exportJson' | 'save' | 'open' | 'new' |
  'duplicate' | 'archive' | 'delete' | 'git' | 'settings' | 'refresh' |
  'note' | 'hypothesis' | 'openSource'; text?: string; observationId?: string };
function validMessage(value: unknown): value is UiMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.type === 'string' &&
    ['import', 'exportMarkdown', 'exportJson', 'save', 'open', 'new', 'duplicate', 'archive', 'delete', 'git',
      'settings', 'refresh', 'note', 'hypothesis', 'openSource'].includes(item.type) &&
    (item.text === undefined || typeof item.text === 'string' && item.text.length <= 2000) &&
    (item.observationId === undefined || typeof item.observationId === 'string' && /^[a-f0-9]{24}$/.test(item.observationId));
}
export class ControlCenter implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private incident: IncidentCase = createCase();
  private readonly sourceUris = new Map<string, vscode.Uri>();
  private git: GitSnapshot | null = null;
  private status = 'EMPTY';
  private details = '';
  private busy = false;
  private readonly store: CaseStore;
  constructor(private readonly context: vscode.ExtensionContext) {
    this.store = new CaseStore(vscode.Uri.joinPath(context.globalStorageUri, 'cases'));
  }
  async open(): Promise<void> {
    if (this.panel) { this.panel.reveal(vscode.ViewColumn.One); return; }
    this.panel = vscode.window.createWebviewPanel('vestigivo.controlCenter', 'Vestigivo RCA — Control Center',
      vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] });
    const panel = this.panel;
    const nonce = randomBytes(24).toString('base64');
    const html = await readFile(join(this.context.extensionPath, 'media', 'control-center.html'), 'utf8');
    panel.webview.html = html.replaceAll('__NONCE__', nonce).replaceAll('__CSP_SOURCE__', panel.webview.cspSource);
    this.context.subscriptions.push(panel.webview.onDidReceiveMessage(value => void this.handle(value)),
      panel.onDidDispose(() => { this.panel = undefined; }));
    this.send();
  }
  private send(): void {
    const value = {
      type: 'state', case: this.incident, status: this.status, details: redactText(this.details),
      git: this.git, busy: this.busy,
      language: vscode.workspace.getConfiguration('vestigivo').get<string>('language', 'auto') === 'auto'
        ? (vscode.env.language.toLowerCase().startsWith('es') ? 'es' : 'en')
        : vscode.workspace.getConfiguration('vestigivo').get<string>('language', 'en')
    };
    void this.panel?.webview.postMessage(value);
  }
  private async handle(value: unknown): Promise<void> {
    if (!validMessage(value) || this.busy) return;
    this.busy = true; this.send();
    try {
      switch (value.type) {
        case 'import': await this.importFiles(); break;
        case 'exportMarkdown': await this.exportReport('md'); break;
        case 'exportJson': await this.exportReport('json'); break;
        case 'save': await this.save(); break;
        case 'open': await this.openStored(); break;
        case 'new': this.incident = createCase(); this.git = null; this.sourceUris.clear(); this.status = 'EMPTY'; this.details = ''; break;
        case 'duplicate': this.incident = duplicateCase(this.incident); this.status = 'COMPLETE'; break;
        case 'archive': this.incident = { ...this.incident, archived: true }; this.details = 'Archived in the current session; save explicitly to persist.'; break;
        case 'delete': await this.deleteStored(); break;
        case 'git': await this.loadGit(); break;
        case 'note': this.incident = addNote(this.incident, value.text ?? ''); break;
        case 'hypothesis': this.incident = { ...this.incident,
          hypotheses: [...this.incident.hypotheses, proposeHypothesis(redactText(value.text ?? ''))] }; break;
        case 'openSource': await this.openSource(value.observationId); break;
        case 'settings': await vscode.commands.executeCommand('workbench.action.openSettings', 'vestigivo'); break;
        case 'refresh': break;
      }
    } catch (error) {
      this.status = 'ERROR'; this.details = error instanceof Error ? error.message : 'Unexpected error.';
    } finally { this.busy = false; this.send(); }
  }
  private async importFiles(): Promise<void> {
    const uris = await vscode.window.showOpenDialog({ canSelectMany: true, canSelectFiles: true, canSelectFolders: false,
      openLabel: 'Import selected evidence locally', filters: { 'JSON / JSONL / structured logs': ['json', 'jsonl', 'ndjson', 'log'] } });
    if (!uris?.length) { this.status = 'CANCELLED'; return; }
    if (uris.length > 5) throw Error('Import at most five files at a time.');
    const config = vscode.workspace.getConfiguration('vestigivo');
    const maxBytes = config.get<number>('maxImportBytes', 8 * 1024 * 1024);
    const maxEvents = config.get<number>('maxEvents', 10000);
    let count = 0, partial = false;
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification,
      title: 'Vestigivo RCA: importing local evidence', cancellable: true }, async (progress, cancellation) => {
      for (const uri of uris) {
        if (cancellation.isCancellationRequested) { partial = true; this.status = 'CANCELLED'; break; }
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.size > maxBytes) { partial = true; this.details = 'Skipped ' + uri.path + ': exceeds byte budget.'; continue; }
        const data = await vscode.workspace.fs.readFile(uri);
        const parsed = parseEvidence(data, uri.path, { maxBytes, maxEvents });
        this.incident = importIntoCase(this.incident, parsed);
        this.sourceUris.set(parsed.source.id, uri);
        count += parsed.observations.length;
        if (parsed.status === 'PARTIAL') partial = true;
        progress.report({ message: parsed.source.name, increment: Math.floor(100 / uris.length) });
      }
    });
    if (this.status !== 'CANCELLED') this.status = partial ? 'PARTIAL' : 'COMPLETE';
    this.details = 'Imported ' + count + ' observations. No external upload performed. ' + (this.details || '');
  }
  private async exportReport(format: 'md' | 'json'): Promise<void> {
    const destination = await vscode.window.showSaveDialog({ saveLabel: 'Export redacted report',
      defaultUri: vscode.Uri.file('vestigivo-report.' + format),
      filters: format === 'md' ? { Markdown: ['md'] } : { JSON: ['json'] } });
    if (!destination) { this.status = 'CANCELLED'; return; }
    const content = format === 'md' ? exportMarkdown(this.incident) : exportJson(this.incident);
    await vscode.workspace.fs.writeFile(destination, new TextEncoder().encode(content));
    this.details = 'Redacted report saved to selected destination.';
  }
  private async save(): Promise<void> {
    const permission = await vscode.window.showWarningMessage(
      'Save this redacted investigation in VS Code local storage? Redaction is best-effort; stored data is not encrypted by Vestigivo.',
      { modal: true }, 'Save locally');
    if (permission !== 'Save locally') { this.status = 'CANCELLED'; return; }
    await this.store.save(this.incident);
    this.details = 'Investigation saved locally on explicit request.';
  }
  private async openStored(): Promise<void> {
    const items = await this.store.list();
    if (!items.length) { this.details = 'No saved cases in local extension storage.'; return; }
    const selected = await vscode.window.showQuickPick(items.map(c => ({
      label: c.title, description: c.archived ? 'Archived' : c.updatedAt,
      detail: c.id, caseId: c.id
    })), { title: 'Open previously saved redacted investigation' });
    if (!selected) return;
    this.incident = await this.store.read(selected.caseId);
    this.sourceUris.clear();
    this.git = null;
    this.status = 'COMPLETE'; this.details = 'Loaded saved redacted case. Original file links require re-import.';
  }
  private async deleteStored(): Promise<void> {
    const items = await this.store.list();
    const selection = await vscode.window.showQuickPick(items.map(c => ({ label: c.title, detail: c.id, id: c.id })),
      { title: 'Select saved case to delete' });
    if (!selection) return;
    const approval = await vscode.window.showWarningMessage('Permanently delete this stored case?', { modal: true }, 'Delete');
    if (approval === 'Delete') { await this.store.delete(selection.id); this.details = 'Stored investigation deleted.'; }
  }
  private async loadGit(): Promise<void> {
    if (!vscode.workspace.isTrusted) { this.status = 'NO_PERMISSION'; this.details = 'Git requires a trusted workspace.'; return; }
    const folders = vscode.workspace.workspaceFolders ?? [];
    if (!folders.length) { this.status = 'NO_PERMISSION'; this.details = 'Open a local workspace first.'; return; }
    const pick = folders.length === 1 ? folders[0] : folders.find(f => f.name ===
      (this.incident.title)) ?? folders[0];
    if (!pick) return;
    const approval = await vscode.window.showInformationMessage(
      'Read up to 20 Git commits in workspace "' + pick.name + '"? No Git writes or shell.',
      { modal: true }, 'Read Git history');
    if (approval !== 'Read Git history') { this.status = 'CANCELLED'; return; }
    this.git = await readGitHistory(pick); this.details = this.git.note;
  }
  private async openSource(id: string | undefined): Promise<void> {
    const observation = this.incident.observations.find(o => o.id === id);
    if (!observation) return;
    const uri = this.sourceUris.get(observation.provenance.sourceId);
    if (!uri) { this.details = 'Original source is not available in this session. Re-import explicitly.'; return; }
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document, { preview: true });
    if (observation.provenance.line) {
      const at = Math.max(0, Math.min(document.lineCount - 1, observation.provenance.line - 1));
      editor.revealRange(new vscode.Range(at, 0, at, 0), vscode.TextEditorRevealType.InCenter);
      editor.selection = new vscode.Selection(at, 0, at, 0);
    }
  }
  dispose(): void { this.panel?.dispose(); }
}
