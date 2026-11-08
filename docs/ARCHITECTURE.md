# Architecture — MVP v0.1

\`\`\`text
VS Code Extension Host
  ├─ activation + command registration
  ├─ user-selected local file import (no background scan)
  ├─ optional trusted Git commit metadata reader (read-only)
  └─ central editor-tab Control Center (strict CSP)
       ↓
pure core: bounded JSON/JSONL + OTLP JSON extraction
       ↓
normalized evidence → correlation by explicit traceId/requestId
       ↓
timeline + source provenance + explicit limitations
       ↓
redacted Markdown export
\`\`\`

Domain types belong in \`src/core/\`, parsing and redaction there are VS Code independent. Adapters in \`src/adapters/\`. Webview UI is in \`src/ui/\`. No service locator, event bus, database or remote API required for the initial vertical slice.

## Data classification
- **Observed:** directly present in selected file.
- **Correlated:** two observations carry the same explicit key. Commit timing is only *context*, never proof.
- **Hypothesis/confirmed:** reserved for future versions requiring explicit evidence contracts; MVP must not manufacture either state.

## Initial bounded scope
Only developer-picked files, UTF-8, JSONL and JSON with documented shapes (generic array, \`events\`/ \`logs\`, OTLP \`resourceSpans\`). Unsupported formats yield a user-facing error. Log fields with unknown schemas remain inconclusive. Never execute imported content. Do not persist original log bodies in workspace storage.
