import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from '@vscode/test-electron';

const EXTENSION_ID = 'armotusitio.vestigivo';
const VERSION = '0.1.0';

/** Installs the actual VSIX in a throwaway VS Code profile before testing its packaged bits. */
async function main(): Promise<void> {
  const repository = resolve(__dirname, '../../..');
  const vsix = join(repository, 'vestigivo-' + VERSION + '.vsix');
  const temporary = await mkdtemp(join(tmpdir(), 'vestigivo-packaged-host-'));
  const extensions = join(temporary, 'extensions');
  const userData = join(temporary, 'user-data');
  try {
    const vscodeExecutablePath = await downloadAndUnzipVSCode();
    const [cliPath, ...baseArgs] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath, { reuseMachineInstall: true });
    if (!cliPath) throw new Error('VS Code CLI unavailable for VSIX installation.');
    const command = (args: string[]): string => {
      const result = spawnSync(cliPath, [
        ...baseArgs, '--extensions-dir=' + extensions, '--user-data-dir=' + userData, ...args
      ], { encoding: 'utf8', timeout: 90_000, maxBuffer: 2 * 1024 * 1024,
        windowsHide: true, shell: process.platform === 'win32' });
      if (result.error || result.status !== 0) {
        throw new Error('VS Code CLI failed: ' + (result.error?.message ?? String(result.stderr).slice(0, 1000)));
      }
      return String(result.stdout);
    };
    command(['--install-extension', vsix, '--force']);
    const installed = command(['--list-extensions', '--show-versions']);
    assert.ok(installed.split(/\r?\n/).some(x => x.trim().toLowerCase() === EXTENSION_ID + '@' + VERSION),
      'VSIX is missing from the isolated installed extension list.');

    const folders = await readdir(extensions, { withFileTypes: true });
    const candidate = folders.find(folder => folder.isDirectory() &&
      folder.name.toLowerCase() === EXTENSION_ID + '-' + VERSION);
    assert.ok(candidate, 'VSIX package files were not extracted under the isolated extensions directory.');
    const installedRoot = join(extensions, candidate.name);
    const manifest = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8')) as {
      publisher?: string; name?: string; version?: string; main?: string;
    };
    assert.equal(manifest.publisher + '.' + manifest.name, EXTENSION_ID);
    assert.equal(manifest.version, VERSION);
    assert.equal(manifest.main, './dist/src/extension.js');

    process.stdout.write('PACKAGED VSIX INSTALL PASS: isolated CLI listing, installed manifest and compiled entry.\n');
    // Test host deliberately points at the just-INSTALLED extracted copy, NEVER the repository.
    // This tests shipped VSIX bytes; it does not claim physical mouse/a11y or a signed release.
    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath: installedRoot,
      extensionTestsPath: join(__dirname, 'suite', 'index'),
      launchArgs: [
        '--extensions-dir=' + extensions, '--user-data-dir=' + userData,
        '--disable-gpu', '--skip-welcome', '--skip-release-notes', '--no-sandbox'
      ]
    });
    process.stdout.write('PACKAGED VSIX HOST PASS: commands, center tab and store on installed package bytes.\n');
  } finally {
    // Remove isolated evidence; do not mutate user's real VS Code profile or extensions.
    try { await rm(temporary, { recursive: true, force: true }); }
    catch { process.stderr.write('WARN: Could not remove isolated temporary VS Code profile.\n'); }
  }
}
void main().catch(error => {
  process.stderr.write('Packaged VSIX Host smoke FAILED: ' + (error instanceof Error ? error.message : String(error)) + '\n');
  process.exitCode = 1;
});
