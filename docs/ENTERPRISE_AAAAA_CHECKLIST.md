# Vestigivo RCA — Checklist técnico Enterprise AAAAA

Última auditoría de estado: **2026-11-08**. Especificación obligatoria: [VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md](VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md).

- Repositorio: **privado**.
- Base al iniciar implementación: `main` @ `6a1ed6fb01a32f302f208330a22f03b9aa1fcd8c` (PR #1 y #2 ya fusionados).
- Rama: `feat/enterprise-aaaaa-incident-intelligence-20261108`.
- Único PR de implementación: [#3, DRAFT](https://github.com/Drako01/vestigivo/pull/3). **No fusionar ni publicar.**
- SHA del código validado al elaborar este corte: `3adcb6d4e392ddf1d5a9080248852f7d3b61fded`; [CI SUCCESS #42500922853](https://github.com/Drako01/vestigivo/actions/runs/42500922853), con **Host macOS WARN** en paso no bloqueante.
- `[x]` significa **implementado o comprobado expresamente en el texto**; no implica cierre de la fase. `[ ]` significa faltante o no acreditado.
- Gates de validación adicionales y límites: [ACCEPTANCE_EVIDENCE.md](ACCEPTANCE_EVIDENCE.md).

## Fase 0 — Identidad / marca — PARTIAL

- [x] Símbolo original de Vestigivo RCA preservado (grafo aprobado, no V/W genérica); recursos SVG existentes intactos.
- [x] Icono Activity Bar monocromático, con `currentColor`, sin rectángulo de fondo.
- [x] PNG de 128 y 256 px incorporados al repositorio y a VSIX; script `scripts/verify-brand.cjs` comprueba tamaño, esquinas alfa 0 y centro opaco. PASS en CI #42500482525.
- [x] Control Center usa trazado inline del símbolo aprobado, no el glifo provisional.
- [ ] Comparación visual humana 16/24/32/48/128/256 px, checkerboard, contraste en temas y fidelidad píxel contra la referencia.
- [ ] Evidencia de branding mediante capturas reales al finalizar UX y validación formal del nombre/marca por el propietario.

## Fase 1 — MVP de evidencia local — PARTIAL

- [x] Extensión VS Code real con TypeScript `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; activationEvents, comandos y entrada Activity Bar.
- [x] Control Center central con Overview, Timeline, Evidence, Traces, Correlations, Git Context, Report, Cases y Settings.
- [x] Parser de archivos elegidos expresamente: JSON/JSONL/NDJSON/log estructurado y OTLP **JSON** de logs y spans; UTF-8, presupuestos de tamaño, profundidad y eventos; errores `PARTIAL`/rechazo.
- [x] Provenance con SHA-256, identificación de fuente, ordinal y número de línea para JSONL; timestamps OTLP nanosegundos y timestamps ambiguos rechazados.
- [x] Correlación estricta por trace/request ID y árbol de spans con padres ausentes, duplicados ambiguos y ciclos reportados; **nunca confirma una causa**.
- [x] Sanitización best-effort y exportación JSON/Markdown; preview acotada, export Markdown demasiado grande rechazado sin truncamiento silencioso.
- [x] Git CLI `execFile` read-only, argumentos fijos, trust workspace y autorización explícita.
- [x] Extensión se activó en Extension Development Host **Linux** y comando abrió editor central: run #42497750439, SHA de ese run `36491449`.
- [ ] E2E de clic físico único en Activity Bar contra la última versión del UI; prueba real de importación por selector, cancelación, múltiples fuentes y navegación al origen.
- [ ] Comprobar que ninguna fuente produce egress involuntario con monitor de red/fixtures y validar fixtures oficiales OTLP.
- [ ] QA real teclado, foco, lector de pantalla, reduced motion, zoom, dark/light/high contrast y ES/EN; el test estático no reemplaza QA visual.
- [ ] Streaming/cancelación a mitad de parseo grande, correlación multi-root/nested git y budgets de CPU con instrumentación.

## Fase 2 — Incident Case Studio — PARTIAL

- [x] Modelo versionado `IncidentCase` y validación de fuentes/observaciones al recuperar un caso.
- [x] Migración de **schema de prueba** v0→v1 cubierta por tests unitarios; futuras migraciones siguen sujetas a control.
- [x] Casos efímeros por defecto; guardar/reabrir/borrar mediante VS Code storage con consentimiento explícito, cuotas y escritura transaccional.
- [x] Crear, duplicar, renombrar, archivar, notas auditables y bookmarks; auditoría básica de modificaciones.
- [x] Comparación con caso guardado: observaciones añadidas/persistentes/ausentes y advertencia de que la ausencia no prueba resolución.
- [x] Tab de árbol de spans con detección de ciclos/padres ambiguos o faltantes.
- [ ] E2E de guardado → cierre completo de VS Code → reinicio → reapertura → exportación contra SHA actual, sin pérdidas.
- [x] Timeline con filtro de fechas UTC, búsqueda, trace/request ID exactos, severidad/servicio, paginación acotada a 100 registros; control de caret y foco del filtro implementado. QA real pendiente.
- [ ] Zoom temporal interactivo, bookmarks navegables avanzados y comparación de casos visual completa.
- [x] Validación adicional de casos: UUID canónico, identidad consistente con archivo, campos raíz explícitos, verificación persistida válida y rechazo de payloads inesperados.
- [ ] Modelo de caso con servicios afectados/entorno/período/decisiones y validación de auditoría profunda; recuperación guiada ante archivos corruptos.
- [ ] E2E del almacenamiento transaccional y borrado en Extension Host **en la última revisión** (suite agregada; CI última revisión dejó smoke Host en SKIP por scope).

## Fase 3 — Integraciones opcionales — PARTIAL

- [x] Investigaciones locales utilizables sin cuenta externa ni conexión.
- [x] Adaptador Sentry y Grafana Cloud opt-in con `SecretStorage`, HTTPS allowlist, no credenciales en URL, `redirect: error`, timeout, límite 512 KiB, GET read-only y desconexión.
- [x] UI con conectar/leer/desconectar; consentimiento explícito antes de cada solicitud remota.
- [x] Tests con mocks: no tráfico al desconectar; Sentry issues, Grafana Cloud annotations, 401/403/404/429, forma inválida y límite de respuesta.
- [ ] Contratos contrastados con APIs y planes actuales de los proveedores, paginación/scopes/filtros completos, event details, deep links y resiliencia ampliada.
- [ ] QA **live** con credenciales autorizadas. No se realizaron llamadas reales a cuentas del usuario.
- [ ] OTLP/HTTP receiver opcional seguro en loopback (no implementado). **OTLP/gRPC Protobuf no soportado**.

## Fase 4 — Hipótesis y causalidad — PARTIAL

- [x] Estados conservadores OBSERVED/CORRELATED/HYPOTHESIS/CONFIRMED/INCONCLUSIVE.
- [x] Hipótesis falsables, evidencia a favor/en contra y evaluador que exige baseline comparable, prueba controlada, intervención causal declarada y repeticiones.
- [x] Fixtures positivos/negativos: falta de baseline, entorno no comparable, falta de intervención, repetición insuficiente y correlación sola no confirman.
- [x] Plan de verificación falsable manual desde Case Studio central: prerequisitos, riesgos, costos, resultados esperados, test ID, persistencia y auditoría. No ejecuta comandos ni confirma causas.
- [ ] Registro de ejecuciones manuales con fingerprints completos, outputs, estado, fecha y comparabilidad demostrable.
- [x] Clasificador puro de outcomes CHECK_PASSED/CHECK_FAILED/TIMEOUT/FLAKY/INCONCLUSIVE; distingue observación introducida, preexistente, ausente y no comparable. Tests negativos.
- [ ] Flujo visual de baseline vs current con evidencia ejecutada y registro completo de resultados de checks.
- [ ] Corpus formal completo de cero falsos `CONFIRMED` bajo todos los escenarios del prompt maestro.
- [ ] Sandbox y allowlist para ejecución segura (no hay ejecutor automático; no habilitar comandos destructivos).

## Fase 5 — Security, performance, quality — PARTIAL

- [x] TypeScript estricto, CSP nonce, `connect-src 'none'`, UI `textContent`, mensajes validados, no CDN.
- [x] Tests de sanitización, tipos hostiles, profundidad, timestamps, estructuras OTLP, límites, JSONL inválido y confirmaciones indebidas.
- [x] `npm ci` con `package-lock.json` v3; auditoría de dependencias de producción PASS, 0 vulnerabilidades en #42499080671.
- [x] **45 pruebas PASS, 0 FAIL** en #42500482525.
- [x] Cobertura **core** medida y gate automático: **96,66 % líneas / 87,61 % ramas** (mínimos >=85/80), CI #42500482525.
- [x] Benchmark determinista **ejecutado** 1K/10K/100K, 7 muestras/caso, P50/P95 y RSS disponibles en [CI #42500482525](https://github.com/Drako01/vestigivo/actions/runs/42500482525); 100K (16,8 MB) rechazo SIZE_LIMIT esperado.
- [x] Medido en Linux Node 22.23.4 / EPYC 7763 2 vCPU: parseo 10K P50 243,676 ms/P95 378,035 ms; export Markdown 10K P50 845,230 ms/P95 1071,101 ms; RSS pico 208,6 MB.
- [ ] Medición de UI real scroll/filter/render y presupuestos de frame/long task; benchmark core no acredita FPS de webview.
- [x] Threat model STRIDE actualizado en [THREAT_MODEL.md](THREAT_MODEL.md); límites, mitigaciones y riesgos residuales documentados; validación de RCA persistido y pre-abort externo con tests.
- [ ] Fuzz/property-based, mutation testing, revisión integral de PII/Markdown/XSS/Unicode/SSRF y revisión de seguridad independiente.
- [x] Matriz nativa CI Windows/Linux/macOS: 45/45 tests, cobertura core, branding y empaquetado OK en los tres OS ([run #42500922853](https://github.com/Drako01/vestigivo/actions/runs/42500922853)). Host Linux/Windows ejecutó; host macOS **FAILED exit -2**, pero job marcó SUCCESS por `continue-on-error`, por lo que **Host macOS sigue WARN/BLOCKED**.
- [ ] WSL/SSH/Dev Containers; QA screen-reader, foco, contraste, alta carga, cancelaciones; resolver Host macOS.
- [ ] Auditoría de licencias y de dependencias de desarrollo (advisories moderate registrados como WARN, sin justificar cierre).

## Fase 6 — Release candidate y documentación — PARTIAL

- [x] Un único Draft PR desde main; ninguna modificación directa a main, merge, release ni publicación.
- [x] Workflow de PR, instalación reproducible `npm ci`, typecheck/tests, cobertura, brand QA, auditoría producción y empaquetado; no workflow de publish.
- [x] VSIX de prueba `vestigivo-0.1.0.vsix` **generado** en #42500482525: 26 archivos, ~54,36 KB; SHA-256 `ba580db5de370ffd647fff938875f3fc54e900b4ddd27dfbd107edd01bc053a9`.
- [x] Acceso al artefacto y SHA256SUMS vía GitHub Actions privado.
- [ ] Instalar el **VSIX empaquetado** y ejecutar E2E sobre esa instalación (Extension Development Host del código no equivale a VSIX instalado).
- [ ] Garantizar branch protection/merge queue o HEAD base actualizado para equivalencia SHA validado vs integrado.
- [ ] Matriz Windows/macOS/Linux, renders reales finales de UI, README ES/EN final, changelog/troubleshooting y publicación solo con aprobación.
- [ ] Inventario final dependencias/licencias, SBOM si corresponde, retención de evidencias de release y reporte de riesgos.
- [ ] Clearance de marca y autorización expresa del dueño para merge/publicación.

## Resultado verificable

- **Fases aceptadas 100 %:** 0 de 7. Todas PARTIAL. No hay porcentaje global de funcionalidades rigurosamente medido.
- **Gates sí aprobados:** 45 tests/0 fallos, cobertura de core superior a mínimos, benchmark real, Extension Host Linux (comandos, editor central, Activity Bar mediante comando, almacenamiento), audit runtime, PNG alpha, `npm ci`, compilación y VSIX candidato sobre SHA `e08deb1`.
- **Gates específicos no aprobados:** clic físico Activity Bar, VSIX instalado, E2E visual final/UX a11y, Webview FPS/scroll, **Host macOS falló con exit -2 pese a job verde**, WSL/SSH/containers, live APIs, seguridad independiente, capturas reales y firma del propietario.
- **Estado del producto:** implementación funcional parcial, **NOT READY FOR MERGE / NOT READY FOR PUBLISH**.

La nueva sesión debe recuperar este archivo, inspeccionar el HEAD del PR #3 y continuar implementando el DoD de las fases 0–6, no generar otra propuesta.

## Checkpoint de continuidad — 2026-11-08 (matriz nativa)

- **Código validado:** `3adcb6d4e392ddf1d5a9080248852f7d3b61fded`. [CI #42500922853](https://github.com/Drako01/vestigivo/actions/runs/42500922853) con tres jobs `success`.
- **Linux:** 45/45 tests, Host real PASS, VSIX checksum `e55ec05c793ebe444586632b31e5d60e7b9adc8cfe6bc85f44da005e31d17048`.
- **Windows:** 45/45 tests, paquete VSIX, Host step `success` (no acredita clic físico), checksum `fc7bc03d83e5dcb0da5018dc3ac38e1d96058d3f911888b33f8762b5cc6d4dd5`.
- **macOS:** 45/45 tests y VSIX PASS, checksum `f9058d85702b0041c642bff63a589deb43e3d1066ca54820d0ab14fb0d575212`. Host `npm run test:host` **FAILED exit -2** en el log, pero `continue-on-error: true` dejó el job verde: **NO interpretar como E2E PASS**.
- Los SHA distintos de VSIX entre plataformas muestran que los paquetes no son byte-for-byte idénticos. Reproducibilidad binaria multiplataforma aún no acreditada.
- **Próximo bloque prioritario:** hacer inequívoco el estado Host macOS, agregar E2E sobre VSIX **instalado** con perfil aislado, no limitarse a Extension Development Host. Después, UX real y screen-reader.
- **No hay capturas finales, ni publicación, ni merge.** `main` intacto; PR #3 sigue Draft. Se agregará una entrada de checkpoint al cerrar cada bloque posterior.
