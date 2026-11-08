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
- [x] VSIX de prueba `vestigivo-0.1.0.vsix` **generado e instalado en perfil aislado** por CI Linux #42501342938: 26 archivos, ~54,36 KB; SHA-256 `b12ff3ce3c7705b5323a4e607cb25d8c62adf8127fe63bc7c69bf07ad1be7a6e`.
- [x] Acceso al artefacto y SHA256SUMS vía GitHub Actions privado.
- [x] VSIX `0.1.0` instalado con CLI real en perfil aislado y Extension Host **sobre el contenido extraído del paquete**, en Linux. [CI #42501342938](https://github.com/Drako01/vestigivo/actions/runs/42501342938) PASS, SHA de código `c534098b3d40b42d25374e2810e0e8562c07004b`.
- [ ] Instalación/E2E de VSIX en perfiles nativos Windows/macOS, no solo empaquetado y Development Host; QA con clic físico y accesibilidad pendiente.
- [ ] Garantizar branch protection/merge queue o HEAD base actualizado para equivalencia SHA validado vs integrado.
- [ ] Matriz Windows/macOS/Linux, renders reales finales de UI, README ES/EN final, changelog/troubleshooting y publicación solo con aprobación.
- [ ] Inventario final dependencias/licencias, SBOM si corresponde, retención de evidencias de release y reporte de riesgos.
- [ ] Clearance de marca y autorización expresa del dueño para merge/publicación.

## Resultado verificable

- **Fases aceptadas 100 %:** 0 de 7. Todas PARTIAL. No hay porcentaje global de funcionalidades rigurosamente medido.
- **Gates sí aprobados:** 45 tests/0 fallos, cobertura de core superior a mínimos, benchmark real, Extension Host Linux (comandos, editor central, Activity Bar mediante comando, almacenamiento), audit runtime, PNG alpha, `npm ci`, compilación y VSIX candidato sobre SHA `e08deb1`.
- **Gates específicos no aprobados:** clic físico Activity Bar, **VSIX instalado fuera de Linux**, E2E visual final/UX a11y, Webview FPS/scroll, **Host macOS falló con ENOENT / exit -2 pese a job verde**, WSL/SSH/containers, live APIs, seguridad independiente, capturas reales y firma del propietario.
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

### Checkpoint — VSIX empaquetado (2026-11-08)

- [x] Añadido `test/host/installed.ts`: instala `vestigivo-0.1.0.vsix` con CLI real en perfil aislado, confirma listado y manifiesto instalado, y arranca Extension Host sobre los **archivos extraídos del paquete**, no sobre `src`.
- [x] Añadidos `npm run test:vsix-host` y gate Linux `xvfb-run -a npm run test:vsix-host` **bloqueante** en CI; el VSIX permanece privado.
- [x] Primera ejecución **PASS**: [CI #42501342938](https://github.com/Drako01/vestigivo/actions/runs/42501342938), Linux 45/45 tests y VSIX instalado/manifest+Extension Host contra bits empaquetados. SHA-256 VSIX Linux `b12ff3ce3c7705b5323a4e607cb25d8c62adf8127fe63bc7c69bf07ad1be7a6e`.
- [ ] Gate no mide clic físico, capturas, pantalla accesible ni publicación.
- [ ] Probar macOS Host que registró `exit -2` con logs/causa; no confundir job verde con Host verde.

La siguiente sesión debe comenzar por el último run del PR #3 y actualizar este bloque con SHA, PASS/FAIL y errores; evitar crear otro PR. **No publicar/fusionar.**

### Checkpoint — VSIX instalado: resultado real (2026-11-08)

- **Último código validado:** `c534098b3d40b42d25374e2810e0e8562c07004b`; docs de checkpoint posteriores no alteran el binario. [CI #42501342938](https://github.com/Drako01/vestigivo/actions/runs/42501342938).
- **Evidencia concreta**: `PACKAGED VSIX INSTALL PASS` (CLI, listado, manifest, entry); `PACKAGED VSIX HOST PASS` (comandos, editor central, storage) ejecutando el árbol **instalado** desde el VSIX y no el repo. 45 tests PASS, 0 FAIL.
- **Linux VSIX**: SHA-256 `b12ff3ce3c7705b5323a4e607cb25d8c62adf8127fe63bc7c69bf07ad1be7a6e`.
- **Limitación:** el test invoca `runTests` con `extensionDevelopmentPath` apuntando al directorio **instalado**, para ejecutar sus bytes. Confirma la instalación y el funcionamiento de esos archivos, **no** mide activación automática del paquete en un perfil de usuario sin `extensionDevelopmentPath`, ni clic físico/UX, ni macOS.
- **Próximo paso:** investigar `macOS ENOENT`, ejecutar VSIX smoke nativo, accesibilidad/temas/capturas reales y flujos importación/cancelación.

### Checkpoint — Preparación de publicación 0.1.1 / bloqueo OIDC (2026-11-08)

**Esta sección prevalece sobre checkpoints históricos que mencionan únicamente 0.1.0.** El PR #3 sigue DRAFT, sin merge ni publicación de 0.1.1, `main` y la visibilidad privada se mantienen sin cambios.

- [x] La captura del propietario muestra **0.1.0 activa en Open VSX**; confirmar por separado la disponibilidad 0.1.0 en Marketplace antes del lanzamiento.
- [x] Versión candidata **0.1.1** en `package.json` y raíz de `package-lock.json`; `test/host/installed.ts` obtiene la versión desde el manifiesto (sin hardcode 0.1.0).
- [x] Nuevo `.github/workflows/publish.yml` solo en `push` a `main`: autoriza incremento de versión, genera **un solo VSIX** y publica el mismo artefacto en Marketplace/Open VSX. **No reejecuta los tres tests del PR en el merge**.
- [x] `scripts/release-guard.cjs` exige SHA del PR fusionado con tree idéntico y último CI verde (Linux/Windows/macOS); controla expresamente el step de Extension Host macOS que puede fallar aun con job verde.
- [x] Marketplace utiliza `vsce publish --oidc` y Environment `marketplace`; no requiere ni utiliza PAT.
- [x] Open VSX mantiene **PAT temporal** como secret de Environment `open-vsx`, porque su UI actualmente rechaza `Drako01/vestigivo` al no resolver repositorios privados. Proceso OIDC pendiente hasta que la instancia ofrezca registro con código (servidor 1.4.0+) y CLI compatible; **no convertir repo a público**.
- [x] README principal profesional, con capacidades y limitaciones verificables y footer `Designed and developed by Alejandro Daniel Di Stefano — © 2026 ArmoTuSitio — MIT`, consistente con Orquestivo/Indizivo; agregado `docs/README_ES.md`, `CHANGELOG.md` y `docs/RELEASE_SETUP.md`.
- [x] CI de PR incluye cambios a `publish.yml` dentro de los paths auditados.
- [ ] **Screenshots reales** del VS Code instalado: todavía no disponibles desde este entorno; no usar ilustraciones o capturas sintéticas como evidencia. El README indica expresamente esta limitación.
- [ ] Completar pruebas integrales y **resolver macOS Host ENOENT / exit -2**, bloqueante por diseño del release guard, además de e2e visual.
- [ ] Configurar Environment `marketplace` y `open-vsx` con protección y `OVSX_PAT` (secret exclusivo de `open-vsx`) por el propietario.
- [ ] Activar política OIDC Marketplace usando workflow `publish.yml`. La captura reportó estado `Inactive / Never` y ventana hasta **2026-11-10 14:05 hora local**; para repo privado, Marketplace exige canje inicial dentro de 48h. Si vence, renovar/recrear cuando se apruebe release.
- [ ] Confirmar `npm ci`, `npm run check`, empaquetado 0.1.1, matrix y SHA exacto en CI **del HEAD nuevo**; capturar run de evidencia.
- [ ] Aprobar merge y publicación únicamente después de DoD, policy/environments y QA del propietario. **Este checkpoint no autoriza merge ni release.**

### Checkpoint — macOS Extension Host RCA y fix del runner (2026-11-08)

- [x] Se recuperó el log real de macOS del CI: `spawn .../Visual Studio Code.app/Contents/MacOS/Electron ENOENT`, `exit -2`. El error coincide con issue upstream [microsoft/vscode-test#349](https://github.com/microsoft/vscode-test/issues/349): macOS ahora utiliza el binario `Code`, no `Electron`.
- [x] `@vscode/test-electron` actualizado de 2.5.2 a **3.1.0** en `package.json` y lockfile con integridad oficial: corrige resolución de `CFBundleExecutable`, requiere Node >=22 (CI ya usa 22).
- [x] Quitado `continue-on-error: true` del smoke nativo macOS/Windows: en CI ya **no se puede disimular el ENOENT como un job verde**. El release guard exige el nuevo step de Host bloqueante.
- [ ] **CI final de esta corrección aún pendiente** sobre código SHA `64b88704c365f6808a994f3b4d07435199d68b13` al actualizar este checkpoint. [Workflow en progreso](https://github.com/Drako01/vestigivo/actions/runs/42504387643). No declarar macOS PASS hasta verificar resultado real.
- [ ] Screenshots auténticas del Control Center instalado y accesibilidad visual siguen sin evidencia; el README no muestra imágenes simuladas. Se requieren capturas desde una sesión gráfica verificable y hosting público de assets para que sean visibles en Marketplace, dado que el repositorio es privado.
- [ ] El workflow de publicación `publish.yml` se agregó **solo en la rama Draft**; OIDC Marketplace y fallback temporal Open VSX PAT se activarán únicamente tras aprobar el merge, con los entornos protegidos y el token configurados por el propietario.

**Fases 0–6: no declaradas completas ni listas para publicación.** Próxima sesión: confirmar el run exacto, actualizar evidencia SHA/PASS/FAIL y continuar las capacidades pendientes del prompt maestro.


### Checkpoint — Elección de repositorio público y Open VSX OIDC (2026-11-08)

- [x] Actualizado `.github/workflows/publish.yml`: el job `open-vsx` utiliza `id-token: write`, `ovsx publish --trusted-publishing`, artefacto único con SHA-256 y elimina el uso del secreto `OVSX_PAT`. Marketplace continúa utilizando OIDC sin cambios.
- [x] Documentación de release, README y changelog alineados con publicación OIDC en ambos registros.
- [ ] **Confirmar visibilidad `public` de `Drako01/vestigivo` en GitHub**: el propietario comunicó la decisión, pero la última consulta todavía lo mostraba `private`.
- [ ] Reintentar registro Trusted Publisher en Open VSX: namespace `armotusitio`, repo `Drako01/vestigivo`, workflow `publish.yml`, environment `open-vsx`.
- [ ] Verificar Environment `open-vsx` con restricciones a `main` y aprobación del propietario. Borrar `OVSX_PAT` si existía una vez activado OIDC.
- [ ] CI verde sobre último HEAD, incluyendo Host macOS real y nuevos cambios de release; capturas reales del IDE y QA de accesibilidad todavía pendientes.
- [ ] Continúan sin permiso merge y publicación de `0.1.1` hasta cumplir DoD; PR #3 permanece Draft.

**Nota de continuidad:** el bloque anterior que describe PAT de Open VSX es histórico y quedó **reemplazado por este checkpoint**.

- [x] Corrección adicional del release guard: `main` todavía no contiene `package.json`. El primer merge con código puede publicar únicamente **0.1.1**, con 0.1.0 manual documentada en changelog y la misma verificación SHA/CI del PR. A partir de ahí exige incremento SemVer normal. Commit `f3316deab73f2401527c440f4f577aef3772ce87`.

### Checkpoint — Trusted Publishing configurado y matriz OS real verde (2026-11-08)

- [x] El propietario confirma que las políticas Trusted Publishing quedaron **registradas y solucionadas en Marketplace y Open VSX**. La configuración UI fue reportada por el propietario; **no se realizó todavía un publish OIDC de 0.1.1**, por lo que el canje de tokens end-to-end permanece no probado.
- [x] GitHub confirma repositorio **público** `Drako01/vestigivo`, sin modificar `main` ni fusionar PR #3.
- [x] CI real [#42506224026](https://github.com/Drako01/vestigivo/actions/runs/42506224026) para código `4feca58c7c7e4376bd5f4d6b012e1d74e33f07de`: **SUCCESS**, tres jobs `success` (Linux, Windows, macOS). En macOS, el paso **Genuine native VS Code Extension Host smoke (blocking)** terminó `success`; ENOENT corregido por `@vscode/test-electron 3.1.0`. En Windows también pasó Host real.
- [x] 45 tests/0 fallos y cobertura core 96,66 % líneas/87,61 % ramas en el CI citado; VSIX 0.1.1 empaquetado y **smoke sobre bits instalados en perfil aislado Linux PASS**. Checksum Linux `f48ac6bd6930619ca6b786283a42086cc21307b6411fa2911a2dc33fb60b522b`.
- [x] Workflows de release preparan el mismo VSIX para ambos registros con OIDC, `id-token: write` y environments `marketplace` / `open-vsx`; publicación solo con merge versionado validado. **Sin PAT**.
- [ ] Verificar desde GitHub que los environments están restringidos a `main` y protegidos por revisores; validar OIDC real únicamente tras aprobar release.
- [ ] Capturas auténticas de VS Code, importación/navegación UX, accesibilidad física, compatibilidad WSL/SSH/containers, caso RCA completo, seguridad exhaustiva y aceptación final del propietario.
- [ ] El PR continúa en **Draft**; no realizar merge ni publicar 0.1.1 hasta completar DoD.

**Regla de continuidad:** este checkpoint reemplaza el estado histórico "macOS ENOENT bloqueado". `0.1.1` sigue siendo una candidata, no un release.
