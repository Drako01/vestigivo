# Vestigivo — implementation checklist (living document)

## Phase 0 — brand and repo
- [x] Private repository and \`main\` initialized.
- [x] Feature branch for review.
- [x] Product vision, evidence contract, security boundaries.
- [x] Dark/Light logo SVG, monochrome Activity Bar icon, editable moodboard and tokens.
- [ ] Human visual inspection for tiny icon and production raster assets.
- [ ] Trademark/name clearance (before public launch).

## Phase 1 — first working version
- [ ] Confirm VS Code extension compiles under strict TypeScript using installed toolchain.
- [ ] Local JSON/JSONL and OTLP JSON ingestion, bounded and redacted.
- [ ] Correlation by trace ID/request ID with explicit provenance.
- [ ] Read-only Git metadata in trusted workspaces.
- [ ] Central editor-tab Control Center with theme-aware UX.
- [ ] Markdown export and cancellation/negative states.
- [ ] Unit tests: valid, invalid, hostile and edge cases.
- [ ] VSIX smoke in official VS Code Extension Host.

## Release controls
- [ ] Lockfile generated/reviewed and reproducible install.
- [ ] PR CI green with actual evidence.
- [ ] Platform and accessibility qualification.
- [ ] README real screenshots (last).
- [ ] Publish workflow approved separately.
- [ ] Do not merge or publish without owner approval.

**Rule:** Mark a task DONE only when code and verification evidence support it; never equate commit with passing tests.
