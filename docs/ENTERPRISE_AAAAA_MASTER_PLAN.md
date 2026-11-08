# Vestigivo RCA — Mapa de requisitos Enterprise AAAAA

Este archivo vincula la especificación obligatoria VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md con el código y gates; no crea otro plan.

| Fase | Código/evidencia inicial | Gate todavía exigido |
|---|---|---|
| 0 | media/brand (SVG preservados) | PNG y alfa, legibilidad y QA humana |
| 1 | src/core/parser, correlate, redact, report; src/ui; git adapter | Extension Host real, fixtures, accesibilidad |
| 2 | src/core/case, src/adapters/store | Persistencia/migración/trace tree/E2E |
| 3 | src/adapters/providers (provisional) | Conectores útiles, mocks, SSRF, QA autorizada |
| 4 | src/core/verification | Corpus adversarial y protocolo de reproducción completo |
| 5 | CSP, TypeScript y tests preliminares | Coverage, benchmarks, OS matrix y threat model |
| 6 | CI del PR #3 | Lockfile, VSIX real/checksum, screenshots y revisión |

El detalle verificable está en ENTERPRISE_AAAAA_CHECKLIST.md y ACCEPTANCE_EVIDENCE.md.
