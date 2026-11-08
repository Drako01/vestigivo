# Vestigivo RCA — Checklist técnico Enterprise AAAAA

Última auditoría de estado: **2026-11-08**. Especificación obligatoria: [VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md](VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md).

- Repositorio: **privado**.
- Base al iniciar implementación: \`main\` @ \`6a1ed6fb01a32f302f208330a22f03b9aa1fcd8c\` (PR #1 y #2 ya fusionados).
- Rama: \`feat/enterprise-aaaaa-incident-intelligence-20261108\`.
- Único PR de implementación: [#3, DRAFT](https://github.com/Drako01/vestigivo/pull/3). **No fusionar ni publicar.**
- SHA del código validado al elaborar este corte: \`72dd9300b8076c0d53a56f38485d3a2bf5cf51a5\`; [CI PASS #42499080671](https://github.com/Drako01/vestigivo/actions/runs/42499080671).
- \`[x]\` significa **implementado o comprobado expresamente en el texto**; no implica cierre de la fase. \`[ ]\` significa faltante o no acreditado.
- Gates de validación adicionales y límites: [ACCEPTANCE_EVIDENCE.md](ACCEPTANCE_EVIDENCE.md).

## Fase 0 — Identidad / marca — PARTIAL

- [x] Símbolo original de Vestigivo RCA preservado (grafo aprobado, no V/W genérica); recursos SVG existentes intactos.
- [x] Icono Activity Bar monocromático, con \`currentColor\`, sin rectángulo de fondo.
- [x] PNG de 128 y 256 px incorporados al repositorio y a VSIX; script \`scripts/verify-brand.cjs\` comprueba tamaño, esquinas alfa 0 y centro opaco. PASS en CI #42499080671.
- [x] Control Center usa trazado inline del símbolo aprobado, no el glifo provisional.
- [ ] Comparación visual humana 16/24/32/48/128/256 px, checkerboard, contraste en temas y fidelidad píxel contra la referencia.
- [ ] Evidencia de branding mediante capturas reales al finalizar UX y validación formal del nombre/marca por el propietario.

## Fase 1 — MVP de evidencia local — PARTIAL

- [x] Extensión VS Code real con TypeScript \`strict\`, \`noUncheckedIndexedAccess\`, \`exactOptionalPropertyTypes\`; activationEvents, comandos y entrada Activity Bar.
- [x] Control Center central con Overview, Timeline, Evidence, Traces, Correlations, Git Context, Report, Cases y Settings.
- [x] Parser de archivos elegidos expresamente: JSON/JSONL/NDJSON/log estructurado y OTLP **JSON** de logs y spans; UTF-8, presupuestos de tamaño, profundidad y eventos; errores \`PARTIAL\`/rechazo.
- [x] Provenance con SHA-256, identificación de fuente, ordinal y número de línea para JSONL; timestamps OTLP nanosegundos y timestamps ambiguos rechazados.
- [x] Correlación estricta por trace/request ID y árbol de spans con padres ausentes, duplicados ambiguos y ciclos reportados; **nunca confirma una causa**.
- [x] Sanitización best-effort y exportación JSON/Markdown; preview acotada, export Markdown demasiado grande rechazado sin truncamiento silencioso.
- [x] Git CLI \`execFile\` read-only, argumentos fijos, trust workspace y autorización explícita.
- [x] Extensión se activó en Extension Development Host **Linux** y comando abrió editor central: run #42497750439, SHA de ese run \`36491449\`.
- [ ] E2E de clic físico único en Activity Bar contra la última versión del UI; prueba real de importación por selector, cancelación, múltiples fuentes y navegación al origen.
- [ ] Comprobar que ninguna fuente produce egress involuntario con monitor de red/fixtures y validar fixtures oficiales OTLP.
- [ ] QA real teclado, foco, lector de pantalla, reduced motion, zoom, dark/light/high contrast y ES/EN; el test estático no reemplaza QA visual.
- [ ] Streaming/cancelación a mitad de parseo grande, correlación multi-root/nested git y budgets de CPU con instrumentación.

## Fase 2 — Incident Case Studio — PARTIAL

- [x] Modelo versionado \`IncidentCase\` y validación de fuentes/observaciones al recuperar un caso.
- [x] Migración de **schema de prueba** v0→v1 cubierta por tests unitarios; futuras migraciones siguen sujetas a control.
- [x] Casos efímeros por defecto; guardar/reabrir/borrar mediante VS Code storage con consentimiento explícito, cuotas y escritura transaccional.
- [x] Crear, duplicar, renombrar, archivar, notas auditables y bookmarks; auditoría básica de modificaciones.
- [x] Comparación con caso guardado: observaciones añadidas/persistentes/ausentes y advertencia de que la ausencia no prueba resolución.
- [x] Tab de árbol de spans con detección de ciclos/padres ambiguos o faltantes.
- [ ] E2E de guardado → cierre completo de VS Code → reinicio → reapertura → exportación contra SHA actual, sin pérdidas.
- [ ] Zoom temporal, bookmarks navegables avanzados, timeline por rango de tiempo/trace/request y comparación de casos visual completa.
- [ ] Modelo de caso con servicios afectados/entorno/período/decisiones y validación de auditoría profunda; recovery seguro ante archivos corruptos.
- [ ] E2E del almacenamiento transaccional y borrado en Extension Host **en la última revisión** (suite agregada; CI última revisión dejó smoke Host en SKIP por scope).

## Fase 3 — Integraciones opcionales — PARTIAL

- [x] Investigaciones locales utilizables sin cuenta externa ni conexión.
- [x] Adaptador Sentry y Grafana Cloud opt-in con \`SecretStorage\`, HTTPS allowlist, no credenciales en URL, \`redirect: error\`, timeout, límite 512 KiB, GET read-only y desconexión.
- [x] UI con conectar/leer/desconectar; consentimiento explícito antes de cada solicitud remota.
- [x] Tests con mocks: no tráfico al desconectar; Sentry issues, Grafana Cloud annotations, 401/403/404/429, forma inválida y límite de respuesta.
- [ ] Contratos contrastados con APIs y planes actuales de los proveedores, paginación/scopes/filtros completos, event details, deep links y resiliencia ampliada.
- [ ] QA **live** con credenciales autorizadas. No se realizaron llamadas reales a cuentas del usuario.
- [ ] OTLP/HTTP receiver opcional seguro en loopback (no implementado). **OTLP/gRPC Protobuf no soportado**.

## Fase 4 — Hipótesis y causalidad — PARTIAL

- [x] Estados conservadores OBSERVED/CORRELATED/HYPOTHESIS/CONFIRMED/INCONCLUSIVE.
- [x] Hipótesis falsables, evidencia a favor/en contra y evaluador que exige baseline comparable, prueba controlada, intervención causal declarada y repeticiones.
- [x] Fixtures positivos/negativos: falta de baseline, entorno no comparable, falta de intervención, repetición insuficiente y correlación sola no confirman.
- [ ] Flujo de planes de verificación desde UI, prerequisitos, riesgos, costos y resultados esperados; registro manual con huellas y estados.
- [ ] Contratos explícitos para CHECK FAILED / timeout / flaky / inconcluso / regresión introducida vs preexistente.
- [ ] Corpus formal completo de cero falsos \`CONFIRMED\` bajo todos los escenarios del prompt maestro.
- [ ] Sandbox y allowlist para ejecución segura (no hay ejecutor automático; no habilitar comandos destructivos).

## Fase 5 — Security, performance, quality — PARTIAL

- [x] TypeScript estricto, CSP nonce, \`connect-src 'none'\`, UI \`textContent\`, mensajes validados, no CDN.
- [x] Tests de sanitización, tipos hostiles, profundidad, timestamps, estructuras OTLP, límites, JSONL inválido y confirmaciones indebidas.
- [x] \`npm ci\` con \`package-lock.json\` v3; auditoría de dependencias de producción PASS, 0 vulnerabilidades en #42499080671.
- [x] **36 pruebas PASS, 0 FAIL** en #42499080671.
- [x] Cobertura **core** medida y gate automático: **95,16 % líneas / 84,00 % ramas** (mínimos >=85/80), CI #42499080671.
- [x] Script determinista para benchmarks de 1K/10K/100K creado; el fixture de 100K debe rechazar/truncar explícitamente.
- [ ] Ejecutar benchmark y publicar evidencia real P50/P95/RSS/bytes/Node/hardware (fue SKIP por scope en último CI). UI scroll/filter/render no medidos.
- [ ] Threat model STRIDE completo y revisado, fuzz/property-based, mutation testing, PII/Markdown/XSS/Unicode/SSRF y revisión de seguridad independiente.
- [ ] Matriz real Windows/Linux/macOS, WSL/SSH/Dev Containers; QA screen-reader, foco, contraste, alta carga, cancelaciones.
- [ ] Auditoría de licencias y de dependencias de desarrollo (advisories moderate registrados como WARN, sin justificar cierre).

## Fase 6 — Release candidate y documentación — PARTIAL

- [x] Un único Draft PR desde main; ninguna modificación directa a main, merge, release ni publicación.
- [x] Workflow de PR, instalación reproducible \`npm ci\`, typecheck/tests, cobertura, brand QA, auditoría producción y empaquetado; no workflow de publish.
- [x] VSIX de prueba \`vestigivo-0.1.0.vsix\` **generado** en #42499080671: 26 archivos, ~51,07 KB; SHA-256 \`ff721e4c440a28f5ef90531a2a3f937ecba5ed4698024939112a8244e2ca4403\`.
- [x] Acceso al artefacto y SHA256SUMS vía GitHub Actions privado.
- [ ] Instalar el **VSIX empaquetado** y ejecutar E2E sobre esa instalación (Extension Development Host del código no equivale a VSIX instalado).
- [ ] Garantizar branch protection/merge queue o HEAD base actualizado para equivalencia SHA validado vs integrado.
- [ ] Matriz Windows/macOS/Linux, renders reales finales de UI, README ES/EN final, changelog/troubleshooting y publicación solo con aprobación.
- [ ] Inventario final dependencias/licencias, SBOM si corresponde, retención de evidencias de release y reporte de riesgos.
- [ ] Clearance de marca y autorización expresa del dueño para merge/publicación.

## Resultado verificable

- **Fases aceptadas 100 %:** 0 de 7. Todas PARTIAL. No hay porcentaje global de funcionalidades rigurosamente medido.
- **Gates sí aprobados:** 36 tests/0 fallos, cobertura de core superior a mínimos, audit runtime sin vulnerabilidades, PNG transparency, \`npm ci\`, compilación y VSIX candidato sobre SHA \`72dd9300\`.
- **Gates específicos no aprobados:** ejecución benchmark, Extension Host final completo, Windows/macOS, live APIs, a11y visual, seguridad integral, capturas reales y firma del propietario.
- **Estado del producto:** implementación funcional parcial, **NOT READY FOR MERGE / NOT READY FOR PUBLISH**.

La nueva sesión debe recuperar este archivo, inspeccionar el HEAD del PR #3 y continuar implementando el DoD de las fases 0–6, no generar otra propuesta.
