# Vestigivo RCA — Evidencia de aceptación reproducible

Corte: **2026-11-08**. Draft PR #3: https://github.com/Drako01/vestigivo/pull/3 — repositorio privado, `main` sin modificar, versión candidata 0.1.0 **NO publicada**.

## SHA y trazabilidad

- HEAD de **código y tests** validado: `e08deb1f17d33e470fa78fb22931bce2feb7929e`.
- CI integral **SUCCESS** [#42500482525](https://github.com/Drako01/vestigivo/actions/runs/42500482525). Los commits de **solo documentación** posteriores no cambian ese binario.
- Tests `45 PASS / 0 FAIL`; cobertura core `96,66 % líneas / 87,61 % branches`, meta >=85/80.
- Pasos PASS: `npm ci` (sin scripts), compilación TypeScript strict, tests+coverage, selección de scope **por diff completo del PR**, Extension Development Host Linux, benchmark 1K/10K/100K, producción `npm audit --omit=dev --audit-level=high`, branding PNG/SVG, empaquetado VSIX y artefactos privados.
- Extension Host real Linux [#42500482525](https://github.com/Drako01/vestigivo/actions/runs/42500482525): activación, comandos registrados, pestaña central, roundtrip storage y delete, apertura del contenedor Activity Bar **mediante comando**. NO equivale a clic físico ni a instalación del VSIX.
- VSIX `vestigivo-0.1.0.vsix`: **26 archivos, ~54,36 KB**, SHA-256 `ba580db5de370ffd647fff938875f3fc54e900b4ddd27dfbd107edd01bc053a9`. Artefacto en el run privado.

## Rendimiento real — benchmark sintético del core

Run: [#42500482525](https://github.com/Drako01/vestigivo/actions/runs/42500482525). `scripts/benchmark.cjs`, siete muestras por tamaño, percentil discreto; entorno **Node v22.23.4 / Linux x64 / AMD EPYC 7763 (2 CPU reportadas), 8.317.030.400 B RAM**.

| Operación | 1K P50 | 1K P95 | 10K P50 | 10K P95 |
|---|---:|---:|---:|---:|
| Parseo JSONL | 32,385 ms | 55,307 ms | 243,676 ms | 378,035 ms |
| Correlación | 1,635 ms | 16,949 ms | 10,784 ms | 32,763 ms |
| Filtro en arrays de observaciones | 0,038 ms | 0,151 ms | 0,185 ms | 0,752 ms |
| Exportación Markdown | 100,536 ms | 103,442 ms | 845,230 ms | 1071,101 ms |

- Tamaños: 1K **162.100 bytes**; 10K **1.650.919 bytes**; ambos importados al 100% en estado `COMPLETE`.
- 100K: **16.809.100 bytes**, estado **SIZE_LIMIT** (rechazo esperado, sin importación parcial oculta).
- RSS al final: **208.613.376 bytes**; memoria pico RSS del proceso **203.724 KiB** (`process.resourceUsage`), sobre un solo runner. No mezclar con consumo de toda la app VS Code.
- **No se midió** FPS, scroll, render/paint del Webview, latencia de picker ni Extension Host CPU con importación concurrente. No extrapolar estos tiempos a Windows/macOS.

## Seguridad y RCA

- Persistencia de casos endurecida: whitelist del objeto raíz, UUID canónico, validación de identidad de archivo, verificación consistente de `CONFIRMED`; **no es firma/tamper-proof**.
- Comparación de CHECK_PASSED/CHECK_FAILED/TIMEOUT/FLAKY/INCONCLUSIVE conservadora, con tests de negativo.
- Planes de verificación humanos con assertion, test ID, prerequisitos, riesgo, costo y resultado esperado; persisten como `PLANNED`; no ejecutan pruebas ni elevan confianza.
- Pre-cancelación de proveedor: test asegura 0 invocaciones al transporte si `AbortSignal` ya estaba cancelada. Integraciones live requieren autorización y credenciales; **NO fueron llamadas**.
- Matriz STRIDE en [THREAT_MODEL.md](THREAT_MODEL.md): los riesgos residuales abiertos no cuentan como PASS de seguridad integral.
- Dependencias runtime: auditoría high PASS; advisories previos en devDependencies precisan clasificación completa con árbol actual.

## QA real faltante / bloqueos

| Prueba | Estado | Razón / gate necesario |
|---|---|---|
| Click físico Activity Bar (una acción), tabs, picker, cancelación y navegación | BLOCKED | E2E GUI real sobre revisión final, no solo ejecución del comando |
| Instalar VSIX resultante en host limpio y reiniciar VS Code | BLOCKED | Extension Development Host no equivale a extensión instalada |
| Dark/light/high contrast, screen reader, foco, teclado completo, zoom, ES/EN | BLOCKED | QA visual/manual y capturas auténticas |
| Windows/macOS/WSL/SSH/Dev Containers | BLOCKED | Entornos no ejecutados en este corte |
| Sentry/Grafana live con scope y paginación reales | BLOCKED | Tokens/cuentas autorizadas no disponibles |
| Egress monitor, falsos negativos PII, fuzz y mutation, licencia/SBOM | PARTIAL | Falta instrumentación/evidencia independiente |
| SHA equivalente al integrado, legal clearance y publicación | OWNER BLOCKED | PR Draft sin aprobación; no se hizo merge |

## Reproducción en entorno autorizado

```bash
git fetch origin
git switch feat/enterprise-aaaaa-incident-intelligence-20261108
npm ci --ignore-scripts --no-fund
npm run check
npm run brand:verify
npm run benchmark
npm run package:vsix
sha256sum vestigivo-0.1.0.vsix
```

Para E2E de desarrollo Linux se requiere escritorio o `xvfb-run -a npm run test:host`. Para Windows/macOS se necesitan sus runners y un VS Code real. Cada gate debe adjuntar SHA, sistema, logs y evidencia; **SKIP/BLOCKED nunca equivalen a PASS**.

**Conclusión:** el código validado pasa gates automatizados del núcleo/Host Linux, benchmarks y artefacto privado. Las siete fases siguen **PARTIAL** por DoD no acreditado. **NOT READY FOR MERGE / PUBLISH**.
