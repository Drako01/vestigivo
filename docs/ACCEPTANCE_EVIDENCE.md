# Vestigivo RCA — Registro de evidencia reproducible

PR: https://github.com/Drako01/vestigivo/pull/3

## Ejecuciones verificadas

- Run 42495295658: https://github.com/Drako01/vestigivo/actions/runs/42495295658
  - HEAD de rama 76f974a34473739ee8d3c796bcbbeab39fbe6eb6; GitHub Actions probó su merge candidate.
  - TypeScript strict: PASS.
  - Tests Node: 7 PASS, 0 FAIL.
  - npm audit --omit=dev --audit-level=high: PASS, cero vulnerabilidades de producción.
  - npm install: 3 vulnerabilidades moderadas (incluye devDependencies), WARN sujeto a análisis.
  - VSIX: FAIL, falta de metadatos repository en package.json (corregido en otro commit).
- Run 42495401770: https://github.com/Drako01/vestigivo/actions/runs/42495401770
  - HEAD de rama f0aa55ed017a52551fa5d3de9804a8866f727282.
  - TypeScript, 7 tests y auditoría de producción PASS.
  - VSIX FAIL: vsce rechaza SVG embebidos en README. README ajustado en commit posterior; hay que volver a verificar.
- Resultado local de conversión de SVG aprobado a PNG con CairoSVG/Pillow: cuatro píxeles extremos alfa 0 y centro alfa 255, tamaños 16,24,32,48,128,256. Los PNG no están aún versionados en el repo: NO acreditar Fase 0 completa.

## Bloqueos

| Criterio | Estado |
|---|---|
| TypeScript + tests base | PASS histórico (SHA exactos arriba); HEAD pendiente |
| Parser/correlator | Pruebas iniciales PASS; cobertura exhaustiva PENDIENTE |
| VSIX | FAIL histórico; corrección sin revalidar |
| npm ci reproducible | BLOCKED: sin package-lock.json |
| Persistencia/versiones | PARTIAL, sin E2E |
| Sentry/Grafana | PARTIAL, adaptador experimental |
| Verificación causal | PARTIAL, corpus incompleto |
| Core coverage 85/80 | BLOCKED: no medida |
| Bench P50/P95/RSS | BLOCKED: no medido |
| Extension Host/UX/a11y/capturas | BLOCKED: sin ejecución real |
| Legal/merge/publish | OWNER BLOCKED |

**No reutilizar PASS de revisión anterior para HEAD diferente.** No hay mediciones válidas de coverage, performance ni seguridad integral.

## Comandos locales

- npm install --ignore-scripts --no-fund
- npm run check
- npm run package:vsix
- sha256sum vestigivo-*.vsix

Hasta versionar un lockfile, la instalación no cumple reproducción estricta.
