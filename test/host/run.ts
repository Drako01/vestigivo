import { runTests } from '@vscode/test-electron';
import { resolve, join } from 'node:path';
async function main(): Promise<void> {
  const root = resolve(__dirname, '../../..');
  await runTests({
    extensionDevelopmentPath: root,
    extensionTestsPath: join(__dirname, 'suite', 'index'),
    launchArgs: ['--disable-workspace-trust', '--disable-gpu', '--skip-welcome', '--skip-release-notes', '--no-sandbox']
  });
}
void main().catch(error => {
  process.stderr.write('Vestigivo Extension Host E2E failed: ' + (error instanceof Error ? error.message : String(error)) + '\n');
  process.exitCode = 1;
});
