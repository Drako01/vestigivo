import * as vscode from 'vscode';
import assert from 'node:assert/strict';
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
  // This tests the command and central tab, not a physical Activity Bar click or a rendered screenshot.
}
