# Vestigivo RCA — Evidencia de aceptación reproducible

Corte: **2026-11-08**. PR **#3 Draft**: https://github.com/Drako01/vestigivo/pull/3

## Fuente de verdad para el último commit de código

- Rama: `feat/enterprise-aaaaa-incident-intelligence-20261108`
- HEAD de código inspeccionado: `72dd9300b8076c0d53a56f38485d3a2bf5cf51a5`
- CI #42499080671: https://github.com/Drako01/vestigivo/actions/runs/42499080671 — **SUCCESS**.
- Pasos PASS en ese run: `npm ci`, build + tests, gate cobertura del core, audit de producción, PNG/SVG QA, VSIX package, SHA256SUMS, artifact upload.
- **36 tests PASS, 0 FAIL.** Coverage sobre `dist/src/core/*.js`: **95,16 % de líneas y 84,00 % de ramas**; thresholds >=85/80.
- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilidades** en dependencias productivas (no extrapolar a devDependencies).
- PNG 128x128: alpha esquina 0 / centro 255, SHA-256 `7fb0232cd7a5a2460196e5bbdbe95bbe9cce1a4365b611d9f550d837b2bd0ed0`.
- PNG 256x256: alpha esquina 0 / centro 255, SHA-256 `a45585d7d34e55f8f0c1d17dde6e6726ffed7e52c3f3eb048bc2a8613a0ba638`.
- Activity Bar SVG: `currentColor` y sin rectángulo de fondo; PASS.
- VSIX `vestigivo-0.1.0.vsix` (26 archivos, 51,07 KB), SHA-256 `ff721e4c440a28f5ef90531a2a3f937ecba5ed4698024939112a8244e2ca4403`. El SHA del VSIX es distinto del SHA del ZIP contenedor del artefacto.

## Extension Host

- CI #42497750439 (código SHA `36491449c856b4b91505fb4751b37919d76bd507`) pasó Extension Development Host real en Linux: activación, comandos registrados y pestaña central.
- Se agregó después una prueba de almacenamiento transaccional y apertura del contenedor Activity Bar. **No está acreditada su ejecución final**: en #42499080671, Host smoke = **SKIP** por filtrado de cambios. No marcar E2E global de la nueva UI como PASS.
- No hay captura real ni QA de clic físico Activity Bar, dark/light/alto contraste, lector de pantalla o empaquetado instalado como VSIX.

## Benchmarks y matriz

- `scripts/benchmark.cjs` existe y genera `benchmark-result.json` para 1K, 10K y rechazo/truncamiento de 100K.
- En #42499080671, paso benchmark = **SKIP** por `paths`; **sin P50/P95/RSS verificables**.
- Windows, macOS, WSL, SSH y Dev Containers: **BLOCKED** sin pruebas ejecutadas.
- Credenciales reales Sentry/Grafana: **BLOCKED** sin autorización; se ejecutaron contratos de proveedor con mocks como parte de tests.

## Limitaciones y riesgos restantes

- Reporte `docs/THREAT_MODEL.md` y checklist necesitan STRIDE y revisión de seguridad integral; no declarar 0 P0/P1 auditados.
- `npm install` de primeras corridas reportó 3 advisories moderados en árbol completo/dev; pendiente clasificación. Auditoría runtime separada PASS.
- Las rutas de endpoints Sentry/Grafana, paginación y permisos deben contrastarse con documentación real, con live QA solo autorizado.
- Sin medición de scroll, CPU/UI responsiveness en hardware objetivo.
- La validación del SHA exacto tras nuevo commit es necesaria para cambios de código; los cambios solo de documentación no requieren repetir typecheck/VSIX.

## Reproducción

```bash
npm ci --ignore-scripts --no-fund
npm run check
npm run brand:verify
npm run benchmark
npm run package:vsix
sha256sum vestigivo-0.1.0.vsix
```

Para pruebas de Host se requieren VS Code y runtime gráfico (en Linux CI: `xvfb-run -a npm run test:host`). El éxito del comando de desarrollo no demuestra la instalación del VSIX.

**Conclusión:** CI núcleo y empaquetado comprobados. DoD fases 0–6 aún incompleto; PR #3 sigue Draft y el repositorio privado.
