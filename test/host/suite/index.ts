import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { CaseStore } from '../../../src/adapters/store';
import { createCase } from '../../../src/core/case';
async function until(predicate: () => boolean, timeoutMs: number): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return false;
}
export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension('armotusitio.vestigivo');
  assert.ok(extension, 'Real extension was not loaded into Extension Development Host.');
  await extension.activate();
  const commands = await vscode.commands.getCommands(true);
  assert.ok(commands.includes('vestigivo.openControlCenter'), 'Control Center command not registered.');
  assert.ok(commands.includes('vestigivo.importEvidence'), 'Import evidence command not registered.');
  await vscode.commands.executeCommand('vestigivo.openControlCenter');
  const active = await until(() => vscode.window.tabGroups.all.some(group =>
    group.tabs.some(tab => tab.label.includes('Vestigivo RCA'))), 10000);
  assert.ok(active, 'Control Center not visible as a central editor tab.');
  process.stdout.write('EXTENSION HOST PASS: activated, commands registered and central editor tab visible.\n');
  const root = vscode.Uri.file(join(tmpdir(), 'vestigivo-host-'+randomUUID()));
  const store = new CaseStore(root);
  try {
    const initial = createCase('Host persistence smoke');
    await store.save(initial);
    const opened = await store.read(initial.id);
    assert.equal(opened.id, initial.id);
    assert.equal(opened.title, initial.title);
    assert.equal((await store.list()).length, 1);
    await store.delete(initial.id);
    assert.equal((await store.list()).length, 0);
    process.stdout.write('EXTENSION HOST PASS: atomic local save, reopen, list and explicit deletion.\\n');
  } finally {
    try { await vscode.workspace.fs.delete(root, { recursive: true }); } catch { /* isolated fixture best effort */ }
  }
  // Workbench view-container command exercises the Activity Bar's registered target, not a physical mouse click.
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  await vscode.commands.executeCommand('workbench.view.extension.vestigivo');
  const reopened = await until(() => vscode.window.tabGroups.all.some(group =>
    group.tabs.some(tab => tab.label.includes('Vestigivo RCA'))), 10000);
  assert.ok(reopened, 'Opening Vestigivo Activity Bar container did not create central editor tab.');
  process.stdout.write('EXTENSION HOST PASS: Activity Bar view-container action opens central Control Center.\n');

}
