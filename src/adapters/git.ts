import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type * as vscode from 'vscode';
import { redactText } from '../core/redact';
const run = promisify(execFile);
export interface GitEntry { sha: string; date: string; subject: string; }
export interface GitSnapshot { repository: string; entries: GitEntry[]; note: string; }
/** Only explicit user request in a trusted workspace; never executes a shell. */
export async function readGitHistory(folder: vscode.WorkspaceFolder): Promise<GitSnapshot> {
  const { stdout } = await run('git', [
    '-c', 'core.pager=cat', 'log', '-n', '20', '--no-show-signature', '--date=iso-strict',
    '--pretty=format:%H%x09%aI%x09%s'
  ], {
    cwd: folder.uri.fsPath, shell: false, timeout: 3500, maxBuffer: 128 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_PAGER: 'cat' },
    windowsHide: true
  });
  const entries = stdout.split(/\r?\n/).filter(Boolean).slice(0, 20).flatMap(line => {
    const [sha, date, ...rest] = line.split('\t');
    if (!sha || !/^[a-f0-9]{40,64}$/.test(sha) || !date) return [];
    return [{ sha, date, subject: redactText(rest.join('\t')).slice(0, 300) }];
  });
  return { repository: folder.name, entries,
    note: 'Read-only Git history is temporal context only. No commit was identified as the cause.' };
}
