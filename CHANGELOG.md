# Changelog

All notable changes to Vestigivo RCA are documented here.

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
