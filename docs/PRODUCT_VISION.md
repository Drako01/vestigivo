# Product Vision — Vestigivo RCA Incident Intelligence

## Product hypothesis
When an incident occurs, engineers waste time reconstructing disconnected logs, traces, Git changes and deployments. Vestigivo RCA should create an evidence-backed local incident case, not a second vendor-specific observability dashboard.

**User persona:** Backend engineers, DevOps engineers, SREs and on-call developers who use VS Code.
**Core question:** What happened, what changed near that event, what can we actually demonstrate, and what remains uncertain?

## Non-negotiable truth contract
1. OBSERVED: a logged event or span explicitly present in source evidence.
2. CORRELATED: evidence shares a stable key (trace ID, request ID) or a clearly labeled temporal proximity; not causation.
3. HYPOTHESIS: explanatory proposal, not an executed fact.
4. CONFIRMED: only a test/reproduction proving a narrowly stated claim, including a comparable baseline when causality is claimed.
5. INCONCLUSIVE: insufficient or incompatible evidence.

No automatic root-cause assertion from timestamp proximity, a stack trace, a changed file or an LLM prediction.

## MVP vertical slice
- Import developer-selected local JSONL/JSON log files and bounded OTLP JSON trace exports.
- Normalize observations without executing code, network calls or modifying workspaces.
- Redact likely secrets in messages, attributes and exported reports.
- Correlate by explicit trace/request ID; build a source-linked incident timeline.
- Read recent Git commit metadata (trusted workspaces only), display it separately as **temporal context**.
- Inspect timeline and evidence in a theme-aware central-editor Control Center.
- Export/copy a reproducible Markdown summary with limitations.
- All external connectors, AI and traffic generation are out of MVP scope.

## Differentiation
Not a trace viewer or log aggregator: a case-building investigation workflow and evidence model, provider-neutral and local-first.

## Responsible product decisions
- Local data may itself contain sensitive information: default exports are redacted.
- Never send source, logs, identifiers or traces to remote endpoints without informed, scoped opt-in.
- Never run shell scripts, Git write operations, deploys or incident remediations automatically.
- Favor deterministic parsing/correlation before AI.
- Do not add orchestration layers or common shared libraries without evidence of cross-extension reuse.
