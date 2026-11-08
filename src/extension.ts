import * as vscode from 'vscode';
import { ControlCenter } from './ui/controlCenter';
export function activate(context: vscode.ExtensionContext): void {
  const center = new ControlCenter(context);
  context.subscriptions.push(center);
  context.subscriptions.push(
    vscode.commands.registerCommand('vestigivo.openControlCenter', () => center.open()),
    vscode.commands.registerCommand('vestigivo.importEvidence', () => center.importFromCommand()),
    vscode.window.registerWebviewViewProvider('vestigivo.launcher', {
      resolveWebviewView(view: vscode.WebviewView): void {
        view.webview.html = '<!doctype html><html><body><p>Vestigivo RCA Control Center opens in the editor.</p></body></html>';
        // VS Code opens Activity Bar containers in the side bar; immediately reveal center and close side bar.
        // The central editor tab remains the product's primary interface.
        void center.open().then(() => vscode.commands.executeCommand('workbench.action.closeSidebar'));
      }
    }, { webviewOptions: { retainContextWhenHidden: false } })
  );
}
export function deactivate(): void { /* Nothing runs in background. */ }
