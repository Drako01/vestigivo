# Engineering Standards — Vestigivo

KISS, DRY, YAGNI, SOLID and Clean Code. Modular TypeScript, strict compiler settings, small pure domain functions, explicit boundaries. Evolve additively.

- **Core:** no VS Code APIs, no network, deterministic normalization and correlation.
- **Adapters:** local file reader, opt-in Git metadata, VS Code UI and exported report.
- **UX:** central editor tab; Activity Bar is a launch entry only; accessible keyboard + reduced motion + theme tokens + ES/EN.
- **Trust:** untrusted workspaces cannot execute Git, start processes or import evidence automatically.
- **Safety budgets:** bytes, events, depth, runtime, output length and Git count bounded.
- **Engineering:** strict typing, no ambient \`any\`, targeted unit/integration tests, 0 false "confirmed" claims, explicit unknowns.
- **Dependency policy:** runtime deps minimized; lockfile required before production/release; third-party advisory results classified WARN when non-actionable, FAIL for exploitable policy-defined high-severity risks.
- **CI:** verify PR revisions; avoid duplicate verification after merge when merge candidate consistency is enforced; publishing is manual until launch approval. No publish workflow during private incubation.
- **Evidence:** no fabricated metrics, measured coverage, performance or certification. Skipped tests are recorded.
- **Release:** actual VS Code Extension Host smoke on each target OS before public release; real screenshots last.
