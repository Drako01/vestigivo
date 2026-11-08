# Threat Model — MVP

**Protected assets:** repository source, local log data (PII and secrets), Git history, VS Code process and user trust.

| Risk | Control | Residual |
|---|---|---|
| Malicious large file | explicit picker, size and event limits | JSON parser memory/CPU; bounded size |
| HTML/JS injection in log | webview DOM \`textContent\`, CSP nonce, no untrusted HTML | validate all message inputs |
| Embedded secrets | redact likely secret patterns and sensitive key-values before UI/export | heuristic redaction cannot guarantee complete sanitization |
| Workspace scripts | never execute package scripts, imported log payloads or external tools | Git CLI only (read-only, trusted workspace) |
| Git command injection | \`execFile\` with fixed arguments, no shell, timeout and output budget | Git executable provided by local environment |
| Accidental exfiltration | zero telemetry, zero outbound API, no AI, no network | VS Code and platform-level telemetry remain independent |
| False RCA claim | evidence-state contract, no causal claim from proximity | user may still infer causality |
| Webview message spoofing | strict message types and source-side checks | extension host remains authority |
| Path traversal | only files selected via VS Code dialog and \`workspace.fs\` | user-selected paths can contain arbitrary data |

**Approval rules:** file picker for each import; no automatic imports; no background Git calls; no remediation; no writes to user repo except explicit export using Save dialog.

**Security validation needed before launch:** adversarial parser corpus, multi-megabyte worst cases, high contrast and screen reader tests, remote development WSL/SSH/Containers; security review of dependency tree.
