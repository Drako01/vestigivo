# Changelog

All notable changes to Vestigivo RCA are documented here.

## [0.2.0] — 2026-11-10 (upgrade candidate; not yet published)

### Evidence integrity and import transparency
- Preserve existing observations on repeated imports and enforce the 100-source case budget before mutating a case.
- Reject persisted cases with duplicate observation identifiers, disconnected source provenance, or bookmarks pointing to missing evidence.
- Validate original-file SHA-256 again before opening a source from the case studio.
- Count only newly accepted observations in the import UI and display partial-import diagnostics and exclusions.

### Reliability, verification and privacy
- Refuse impossible calendar timestamps rather than allowing permissive JavaScript date normalization.
- Bound malformed JSONL diagnostics and safely normalize nested OTLP attributes with prototype-like field names.
- Resolve trace trees iteratively with memoized ancestry for deep and wide traces.
- Demand different baseline/current version fingerprints before confirming an isolated RCA assertion.
- Validate restored Sentry/Grafana credentials before using them for an external request.
- Recover safely when the Control Center HTML fails to load and release its message listeners on panel disposal.

### Quality and documentation
- Add adversarial regression tests for import budgets, temporal correctness, references, false RCA confirmation and deep traces.
- Refresh README and visual QA to include six authentic VS Code screens, including Evidence and Report.
- Preserve existing immutable VSIX/GitHub Release publishing gates and owner-controlled merge authority.

## [0.1.2] — 2026-11-08 (release candidate)

- Add an automated, versioned GitHub Release only after successful Marketplace and Open VSX OIDC publication.
- Attach the **same verified VSIX** published to both registries together with its SHA-256 checksum.
- Protect the release tag from accidental reuse or retargeting; verify existing releases and prevent asset overwrite.
- Preserve one release build: no duplicate PR CI or separate VSIX rebuild on merge.

## [0.1.1] — 2026-11-08 (published)

- Introduce the central Incident Intelligence Control Center with source-provenance evidence import, precise timelines, correlations, trace trees and case investigations.
- Add bounded local case persistence, bookmarks, case comparison, report exports and manual verification planning.
- Harden persisted verification claims, redaction, input limits and opt-in Sentry/Grafana integration.
- Include cross-platform core gates, Linux packaged-VSIX smoke and repeatable core benchmarks.
- Prepare version-gated Trusted Publishing via OIDC in both Visual Studio Marketplace and Open VSX, contingent on the public GitHub repository and registered protected environments.
- Shipped to Visual Studio Marketplace and Open VSX via trusted publishing. Native Host smoke passed on Linux, Windows and macOS; manual accessibility/remote-environment gates remain on the roadmap.

## [0.1.0] — Manual bootstrap

- Initial privately built VSIX for manual distribution to both extension registries.
- Initial product identity and local-first investigation foundation.

Release status is tracked in [docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md).
