<p align="center">
  <img src="media/brand/vestigivo-icon-256.png" width="144" height="144" alt="Vestigivo RCA — connected evidence graph">
</p>

<h1 align="center">Vestigivo RCA</h1>

<p align="center">
  <strong>Incident Intelligence &amp; Root Cause Analysis for Visual Studio Code</strong><br>
  <em>Every incident leaves evidence.</em>
</p>

<p align="center">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-4BD8CC">
  <img alt="VS Code 1.96+" src="https://img.shields.io/badge/VS_Code-1.96%2B-141E29">
  <img alt="Privacy local-first" src="https://img.shields.io/badge/privacy-local--first-8566DF">
</p>

**A structured workspace for incident investigations — not a black-box root-cause oracle.**

<p align="center">
  <img src="media/screenshots/01-overview.png" alt="Actual Vestigivo RCA Control Center inside Visual Studio Code, with synthetic checkout incident evidence and investigation metrics" width="100%">
</p>

<p align="center"><sub>Actual Visual Studio Code screenshot · Vestigivo RCA 0.1.1 candidate · fully synthetic demonstration data</sub></p>

Vestigivo RCA brings together logs, distributed traces, exact-identifier correlations and investigator notes in a single Control Center inside the editor. It preserves the separation between **what was observed**, **what was correlated**, **what is still a hypothesis** and **what an explicitly controlled check can establish**.

## Why Vestigivo?

Incidents often involve several services, timestamps with differing precision, incomplete spans and separate sources. The risk is not just missing a signal: it is mistaking temporal proximity or a plausible story for proof.

Vestigivo turns selected evidence into a **traceable, bounded investigation**. It records where each observation came from and explicitly marks missing or ambiguous information. It never performs automatic remediation, uploads local logs or claims that correlation proves causation.

## Current capabilities (0.1.2)

| Area | What it does |
| --- | --- |
| **Evidence import** | Explicit local import of JSON, JSONL, NDJSON, structured `.log` and OpenTelemetry **JSON** logs/spans, with SHA-256 provenance and bounded parsing |
| **Timeline** | UTC date filters, text, severity, service and exact trace/request-ID filtering; pages of up to 100 observations |
| **Trace investigation** | Trace/span parent relationships; missing parents, cycles and ambiguous duplicate parents are identified rather than hidden |
| **Correlation** | Exact trace ID, request ID and parent-span matching, always labeled **CORRELATED — not causal proof** |
| **Case Studio** | Create, rename, duplicate, archive, annotate, bookmark and compare cases; local persistence is an explicit choice |
| **Hypotheses** | Human-authored falsifiable statements and verification plans with assertions, preconditions, expected outcomes, risks and cost — no automatic execution |
| **Verification** | Conservative evaluation contracts and distinct outcomes for introduced, pre-existing, absent, non-comparable or inconclusive observations |
| **Reports** | Redacted JSON and Markdown export with limitations and sources; oversized exports fail rather than silently lose records |
| **Git context** | Optional, read-only recent history in trusted workspaces; never automatically attributes a problem to a commit |
| **External context** | Optional read-only Sentry issues and Grafana Cloud annotations, with per-read consent and tokens stored in VS Code SecretStorage |
| **Interface** | Central editor Control Center with English/Spanish navigation, VS Code theme tokens, keyboard tab switching and no external scripts |

## Control Center

Use the **Vestigivo RCA** icon in the Activity Bar or run `Vestigivo RCA: Open Control Center`. The main interface opens in an **editor tab**, not as a narrow sidebar.

**Overview · Timeline · Evidence · Trace Tree · Correlations · Git Context · Report · Case Studio · Settings**

To try a local investigation, choose **Import evidence**, select up to five supported files and inspect the resulting timeline and source fingerprints. In **Case Studio**, record a falsifiable hypothesis and — if appropriate — a *manual* verification plan. Save or export only when you explicitly choose to.

### Explore the investigation workspace

All four screenshots below were captured from **the actual Vestigivo RCA webview running inside the Visual Studio Code Extension Development Host** on Linux, not redrawn or visually simulated. The incident is a **clearly labeled synthetic fixture**, parsed through the same evidence pipeline as local files. No real customer logs, tokens or incident data were used.

#### 01 — Timeline: search, filter and inspect

Use exact trace/request identifiers, UTC date ranges, service and severity filters. Records retain source provenance and missing timestamps are not invented.

![Vestigivo RCA Timeline showing real UI rendering, filters and synthetic example observations inside VS Code](media/screenshots/02-timeline.png)

#### 02 — Trace Tree: follow observed relationships

Explore span ancestry and inspect what is known, missing or ambiguous. Shared trace identifiers do **not** establish causation.

![Vestigivo RCA Trace Tree in VS Code showing synthetic spans and evidence-derived relationships](media/screenshots/03-trace-tree.png)

#### 03 — Case Studio: build an evidence-backed investigation

Create and manage hypotheses, add notes, bookmark observations and document **manual verification plans**. A proposed explanation does not become a verified finding merely because it is recorded.

![Vestigivo RCA Case Studio in VS Code displaying a synthetic incident and a manual verification plan](media/screenshots/04-case-studio.png)

<sub>Capture provenance: `media/screenshots/` · genuine Linux VS Code Electron/Xvfb screenshots, 1440 × 900, generated by the reproducible visual QA harness. The synthetic JSONL fixture is at `test/fixtures/visual-demo.jsonl`. See the [technical checklist](docs/ENTERPRISE_AAAAA_CHECKLIST.md).</sub>

## Evidence and confidence

| State | Meaning |
| --- | --- |
| `OBSERVED` | A record was imported with provenance. It may still be incomplete or inaccurate. |
| `CORRELATED` | Records share exact identifiers. This does **not** show causality. |
| `HYPOTHESIS` | A possible explanation requiring a falsifiable check. |
| `CONFIRMED` | A **narrow assertion** passes the comparison and controlled-intervention gates; not a claim about the whole incident. |
| `INCONCLUSIVE` | The evidence or comparison is not sufficient to assert that specific conclusion. |

A verification plan with status `PLANNED` is **not** a test execution. Baseline/current comparisons distinguish introduced and pre-existing *observations*, never automatically prove a regression was caused by a particular change.

## Privacy and trust model

- **Local-first:** no automatic file scanning, uploads, telemetry or AI calls by Vestigivo.
- **Opt-in access:** local imports use VS Code file pickers; Git inspection requires workspace trust and authorization; Sentry/Grafana require separate connection and an explicit read approval.
- **Secret handling:** provider credentials remain in VS Code SecretStorage. Reports and stored cases use **best-effort** redaction; no guarantee that every secret or personal datum is detected.
- **Storage:** cases are ephemeral until explicitly saved. Saved cases are not encrypted by Vestigivo; OS/VS Code protections apply.
- **No remediation:** never executes a captured command, changes a repository or deploys infrastructure to resolve an incident.

See [Threat Model](docs/THREAT_MODEL.md), [Architecture](docs/ARCHITECTURE.md) and [Acceptance Evidence](docs/ACCEPTANCE_EVIDENCE.md).

## Supported inputs and known limitations

JSON-based logs and OTLP JSON are supported. **OTLP/gRPC Protobuf, a local OTLP collector, streaming imports, automated verification execution and broad causal inference are not implemented.** Timestamp ambiguity remains explicit. Source limits default to 8 MiB per file and 10,000 observations per case.

Core tests, packaging and genuine Extension Host smoke now pass on Linux, Windows and macOS. WSL, SSH, Dev Containers, in-depth graphical accessibility audits and live cloud-provider checks remain [release gates](docs/RELEASE_READINESS.md); do not infer certification from a passing unit test.

## Development

Prerequisites: **Node.js 22**, npm and Visual Studio Code **1.96+**.

```bash
npm ci --ignore-scripts --no-fund
npm run check              # TypeScript, core tests and coverage gates
npm run brand:verify
npm run benchmark          # Synthetic 1K / 10K / 100K budget exercise
npm run package:vsix       # vestigivo-<version>.vsix
```

For a genuine Extension Development Host on a graphical environment, build first and run `npm run test:host`. On Linux CI, `xvfb-run -a npm run test:vsix-host` tests the installed VSIX bytes in an isolated profile.

**Release policy:** `0.1.0` was bootstrapped manually and `0.1.1` was published via Trusted Publishing. `0.1.2` is the next candidate, adding a GitHub Release alongside Marketplace and Open VSX. Pull requests execute validation; only an approved, version-bumping merge into `main` may initiate automated publishing. The repository visibility is controlled separately by the owner; publishing does not change it. See [GitHub Releases](https://github.com/Drako01/vestigivo/releases), [Release Readiness](docs/RELEASE_READINESS.md), [Release Setup](docs/RELEASE_SETUP.md), [Master Specification](docs/VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md) and [Technical Checklist](docs/ENTERPRISE_AAAAA_CHECKLIST.md).

### Language

English is used for the marketplace README and the main technical API names. [Documentación en español](docs/README_ES.md).

## License and authorship

Distributed under the [MIT License](LICENSE). The repository is public; the software and contributions are covered by the terms in the license file.

---

<p align="center">
  <strong>Designed and developed by Alejandro Daniel Di Stefano</strong><br>
  © 2026 <a href="https://armotusitio.com.ar">ArmoTuSitio</a> · Open source under the MIT License
</p>
