# Auditoría independiente — Vestigivo RCA 0.1.2 → 0.2.0
**Fecha:** 2026-11-10 · **Auditoría de referencia:** `main@90f518f0b5c2ad40e156fe5eb376add4ffd49513` · **Rama de remediación:** `feat/audit-hardening-v0.2.0` · **PR:** [#5](https://github.com/Drako01/vestigivo/pull/5)

## Resumen ejecutivo
**Nota inicial provisional: 72/100 · confianza MEDIA · release inicial: APTO CON RIESGOS, sujeto a remediación P1 y CI exacto.** El resultado refleja la implementación de 0.1.2 inspeccionada antes de los cambios de 0.2.0. No se asigna una nueva nota hasta verificar los tests y las capturas finales.

El proyecto implementa una extensión VS Code local-first con separación adecuada entre core puro, adapters, extension host y webview. El producto distingue correctamente correlación de causalidad, tiene parsers acotados, CSP nonce, redacción best-effort, almacenamiento opt-in, SecretStorage, OIDC y release basado en un único VSIX. **Sin embargo:** se identificaron rutas donde una reimportación sobrescribía evidencia, podían reabrirse referencias persistidas incoherentes, una verificación podía confirmarse comparando versiones iguales y podía abrirse una fuente distinta a la originalmente verificada. La complejidad de reconstruir trazas largas y algunas rutas de diagnóstico/CI requerían reforzar límites. La política de aprobación de PR impone una fricción real a un único propietario; no se modificó porque pertenece a gobernanza operativa y no invalida las verificaciones técnicas.

**Cinco fortalezas a preservar:** (1) normalización local de evidencias sin escaneo ni uploads implícitos; (2) estados explícitos OBSERVED/CORRELATED/HYPOTHESIS/CONFIRMED/INCONCLUSIVE y ausencia de RCA automática; (3) CSP y uso de textContent en la webview; (4) tokens en SecretStorage y consultas consentidas a hosts concretos; (5) pipeline de un VSIX verificado con SHA-256 para Marketplace, Open VSX y GitHub Release.

**Cinco riesgos más relevantes:** R1 cambio silencioso de una observación por ID repetido (P1); R2 referencias de fuente/observación inconsistentes al reabrir archivos persistidos (P1); R3 confirmación de hipótesis sin versiones diferentes (P1); R4 vínculo a fuente local alterada después de importar (P1); R5 bloqueo del Extension Host con árboles de spans largos y datos hostiles cercanos a presupuestos (P2). La redacción heurística NO equivale a protección completa de PII.

**Tres acciones de mayor retorno:** preservar inmutabilidad de observaciones y validar referencias; endurecer el gate RCA y ligar apertura de fuente a su hash; añadir suites adversariales y cerrar checks multiplataforma sobre el SHA exacto.

## 1. Ficha y método
- Repositorio: [Drako01/vestigivo](https://github.com/Drako01/vestigivo), público, owner único, rama default `main`.
- Baseline auditado: `90f518f0b5c2ad40e156fe5eb376add4ffd49513`, versión `0.1.2`, release [v0.1.2](https://github.com/Drako01/vestigivo/releases/tag/v0.1.2), 2026-11-08.
- Rama upgrade: `feat/audit-hardening-v0.2.0`; PR #5; sin PR abiertos al comenzar.
- Superficie: extensión VS Code TypeScript/CommonJS, parser JSON/JSONL/NDJSON/OTLP JSON, trace graph, reportes, almacenamiento global local, Git, proveedores Sentry/Grafana y webview.
- Acceso: lectura directa GitHub REST + API de contenidos, árbol recursivo `main` (respuesta completa, `truncated=false`). Inspección profunda de core, adapters, host, tests, CI, release, README y threat model; inspección focal de UI HTML y screenshots.
- Ejecución independiente local: **NO EJECUTADA**. Se inspeccionaron logs del PR #5 y CI históricos; no se atribuyen sus resultados a una ejecución del auditor. No se ejecutaron scripts o instalaciones en el entorno personal del owner.
- Sin acceso confirmado a pruebas live de Sentry/Grafana, WSL/SSH/Dev Containers, pentest externo o a11y con lector de pantalla.
- Evidencia de control: rulesets [Protect main](https://github.com/Drako01/vestigivo/rules/26801344) y [Protect release tags](https://github.com/Drako01/vestigivo/rules/26801349) activos; branch-protection API clásica inaccesible por 403.

## 2. Inventario y mapa arquitectónico
```text
VS Code Extension Host (src/extension.ts)
  └─ Control Center (src/ui/controlCenter.ts) ↔ nonce-CSP webview (media/control-center.html)
       ├─ parser.ts → redaction.ts → case.ts / correlate.ts / verification.ts → report.ts
       ├─ adapters/store.ts → VS Code globalStorageUri (solo guardar con opt-in)
       ├─ adapters/git.ts → git log (trusted workspace + autorización)
       └─ adapters/providers.ts → SecretStorage + GET HTTPS explícito Sentry/Grafana
CI pull_request → core coverage / native host / VSIX instalado / captura sintética real
push main → release-guard exact-PR-tree → VSIX único → Marketplace + Open VSX → GitHub Release
```
La separación núcleo/adapters/UI es útil y no exige reescritura. No se encontraron justificaciones para microservicios, base de datos remota ni agentes automáticos.

## 3. Scorecard predefinido (0–100, baseline provisional)
| Dimensión | Máximo | Nota inicial | Fortalezas, debilidades y evidencia |
| --- | ---: | ---: | --- |
| A. Arquitectura y límites | 15 | **13** | Core puro y adapters separados; ControlCenter extenso y estado UI altamente acoplado [controlCenter.ts](../src/ui/controlCenter.ts). |
| B. Correctitud funcional y contratos | 20 | **13** | Semántica de evidencia explícita; P1 de sobrescritura por ID, referencias persistidas y RCA mismo versionHash [case.ts](../src/core/case.ts), [verification.ts](../src/core/verification.ts). |
| C. Mantenibilidad | 15 | **12** | TS strict, funciones especializadas, tests; UI concentrada y algunas invariantes duplicadas [tsconfig.json](../tsconfig.json). |
| D. Seguridad, privacidad, supply chain | 15 | **11** | CSP, allowlists, redacción, secretos; heurísticas no exhaustivas, Git host configurable, control de origen fuente insuficiente [providers.ts](../src/adapters/providers.ts), [redact.ts](../src/core/redact.ts). |
| E. Testing y evidencia | 15 | **11** | Adversarial, core, host instalado y cobertura con umbrales; sin pruebas independientes live/E2E remoto/manuales ni evidencia de todos los casos negativos. |
| F. CI/CD y operabilidad | 10 | **7** | Actions pinning, OIDC, hash, provenance por tree; captura codificada para rama vieja, `strict_required_status_checks_policy:false`, squash requerido [ci.yml](../.github/workflows/ci.yml). |
| G. Performance y resiliencia | 5 | **2** | Benchmark sintético reproducible; traceTree repetía ascensos y no mide render/scroll/p99 real [correlate.ts](../src/core/correlate.ts). |
| H. DX, a11y y documentación | 5 | **3** | README, capturas reales y teclado; versiones/documentos heredados, QA manual a11y aún pendiente. |
| **TOTAL** | **100** | **72** | **Nota inicial provisional; no constituye certificación.** |

Confianza **MEDIA** porque el árbol y código crítico eran accesibles, se contrastaron tests/CI/rulesets y se reprodujo un error en CI; no hubo ejecución de pruebas locales independiente ni validación de entornos productivos.

## 4. Fortalezas demostradas
- Parse con `TextDecoder(fatal)`, presupuestos, timestamps desconocidos explícitos; `src/core/parser.ts`.
- `correlate` exige trace/request ID exactos, no proximidad temporal; `src/core/correlate.ts`.
- `validStoredHypothesis` examina gates de RCA persistidos, aunque faltaba exigir versiones distintas; `src/core/verification.ts`.
- Webview con `default-src 'none'`, CSP nonce, `connect-src 'none'`, DOM por `textContent`; `media/control-center.html`.
- Release rechaza cambios sin versión, PR merged, matching tree y CI exacto; `scripts/release-guard.cjs`, `.github/workflows/publish.yml`.

## 5. P0
**No se ha confirmado ningún P0.** La ausencia de P0 confirmado no equivale a una garantía de inexistencia de vulnerabilidades.

## 6. Hallazgos P1 y contraprueba
**AUD-P1-001 — Reimportación modifica evidencia con ID ya conocido. CONFIRMADO en código base.** `src/core/case.ts:15-24` asignaba `old.set(item.id,item)` cuando el ID ya existía. Contraprueba: el parser produce ID determinista por hash; aun así, `importIntoCase` es API exportada que acepta ImportResult y los archivos existentes podrían alterarse. **Fix:** ignorar reimportaciones de IDs existentes, rechazar colisiones de fuente SHA y contabilizar exclusiones. **DoD:** observación original intacta y presupuesto de 100 fuentes fail-closed. Esfuerzo S. Riesgo residual: no hay firma de autenticidad de la fuente original.

**AUD-P1-002 — Carga acepta referencias incoherentes. CONFIRMADO.** `src/core/case.ts:42-127` validaba formato de IDs pero no existencia del sourceId, unicidad de IDs o bookmarks a evidencias reales. Contraprueba: CaseStore limita nombres de archivo, pero no garantiza consistencia interna JSON. **Fix:** validar IDs de fuente/observación, vínculo provenance.sourceId/importId, líneas y bookmarks. **DoD:** fixtures corruptos rechazan con error y casos válidos migrados preservan registros. Esfuerzo M. Riesgo residual: manipulación coherente con todos los metadatos aún no es detectable criptográficamente.

**AUD-P1-003 — Verificación podía confirmar sin versión intervenida distinta. CONFIRMADO.** `src/core/verification.ts:112-139` y `:26-79` comparaban input/config/environment/testId, sin exigir `baseline.versionHash !== current.versionHash`. Contraprueba: causalIntervention=true puede representar cambio externo a versión; por criterio de rastreabilidad, sin diferencia de versión rastreada la afirmación debe quedar inconclusa. **Fix:** misma regla al evaluar y cargar. **DoD:** versión igual resulta INCONCLUSIVE; versión distinta y resto de gates válido puede confirmar. Esfuerzo S.

**AUD-P1-004 — Abrir origen podía presentar un archivo diferente del importado. CONFIRMADO.** `src/ui/controlCenter.ts:327-342` mantenía URI en sesión y abría archivo sin recomprobar SHA-256. Contraprueba: la UI advierte que el enlace requiere sesión actual, pero el archivo puede cambiar durante la misma sesión. **Fix:** rehash antes de abrir y rechazo si cambió. **DoD:** cambio de archivo bloquea apertura hasta reimportar. Esfuerzo S.

**AUD-P1-005 — Resultado multiarchivo podía ocultar rechazos o exclusiones. OBSERVADO.** `src/ui/controlCenter.ts:230-267` sumaba `parsed.observations.length` aunque no todos entraban al caso; un error individual podía impedir importar archivos posteriores. Contraprueba: el core sí generaba una limitación en presupuesto excedido, pero el estado de UI no la exponía de forma exacta. **Fix:** capturar errores por fuente, contar solo nuevos aceptados y exponer PARTIAL/ERROR explícitos. **DoD:** import mixto permite éxito parcial y expone exclusiones. Esfuerzo M.

## 7. Hallazgos P2/P3
**AUD-P2-001 — Timestamp calendario imposible normalizado. CONFIRMADO en comportamiento potencial de Date.parse.** `src/core/parser.ts:44-68`. **Fix:** comprobación calendárica explícita antes de Date.parse; tests para febrero, meses, horas, zona. Esfuerzo S.

**AUD-P2-002 — Diagnósticos JSONL ilimitados cerca de 8 MiB. OBSERVADO.** `src/core/parser.ts:99-203`; `issues.push` por cada fila inválida. **Fix:** contador total y solo 49 mensajes concretos + resumen final; estado PARTIAL permanece. Esfuerzo S.

**AUD-P2-003 — Ancestría traceTree recalculada por span. OBSERVADO.** `src/core/correlate.ts:51-85`. **Fix:** recorrido iterativo con memoización de ancestros, manteniendo detección de ciclos/ambigüedades; suite de cadena larga. Esfuerzo M. La mejora de p95 es una hipótesis hasta benchmark comparable.

**AUD-P2-004 — Credencial persistida insuficientemente validada. OBSERVADO.** `src/adapters/providers.ts:70-83`: valida tipo de token recuperado, no longitud ni saltos de línea. **Fix:** revalidación al restaurar, sin aceptar entradas corruptas. Esfuerzo S.

**AUD-P2-005 — Capturas del upgrade no podían versionarse con el guard anterior. CONFIRMADO.** `.github/workflows/ci.yml:145-218` tiene condición de rama específica de PR histórico; al incorporar nuevas capturas el job debe apuntar a la rama actual. **Fix:** agregar paneles Evidence/Report al host visual y ajustar guard a esta rama. Esfuerzo M. Un nuevo run CI debe producir y versionar PNG válidos.

**AUD-P2-006 — Recursos de panel y fallos al abrir HTML. OBSERVADO.** `src/ui/controlCenter.ts:56-71` crea panel antes de leer HTML, registra listeners en subscriptions hasta fin de extensión. **Fix:** dispose de listeners con panel y rollback al fallar lectura. Esfuerzo S.

**AUD-P3-001 — README y documentos con versión anterior. OBSERVADO.** README seguía citando `0.1.2` como candidata; `docs/ARCHITECTURE.md` menciona MVP antiguo. **Fix:** README 0.2.0, CHANGELOG, nueva arquitectura y evidencia de capturas reales. Esfuerzo S.

## 8. Threat model y segunda pasada adversarial
Actores: operador legítimo, archivo de evidencia malicioso, archivo de caso manipulado, proveedor comprometido y actor con acceso al repositorio/CI. Activos: verdad observacional, datos sensibles, SecretStorage, archivo JSON de casos, identidad del VSIX, confianza RCA. Fronteras: file-picker → parser; disco local → loadCase; webview → host; red HTTPS → ProviderClient; PR → CI → release.

**Pasada adversarial ejecutada sobre código:** se siguieron flujos import → normalización → store → reopen → report; hipótesis → plan → verification; trace → ancestry; provider → SecretStorage → GET; source link → archivo; release → PR CI → immutable VSIX. Se buscaron controles alternativos y se conservaron los encontrados: UI nonce-CSP, `redirect:'error'`, límites HTTP 512 KiB, `execFile` sin shell y `GIT_TERMINAL_PROMPT=0`. No se probaron proveedores live, no hubo fuzz extensivo ni pruebas de inyección en un host real. Las afirmaciones de causalidad dependen de evidencias humanas; incluso `CONFIRMED` no equivale a verificación externa automática.

## 9. Tests y brechas
Existen `test/core.test.ts`, `adversarial.test.ts`, `verification-integrity.test.ts`, `providers.test.ts`, `ui-contract.test.ts`, `release-contract.test.ts` y smoke del Extension Host; cobertura requerida por `npm run check`: líneas de core ≥85 %, ramas de core ≥80 %. El script `benchmark.cjs` ejecuta 1K/10K/100K con límites y 7 repeticiones, pero no valida UX a 100K ni latencias p99 en producción.

**CI primera ejecución del PR:** [run #42878904613](https://github.com/Drako01/vestigivo/actions/runs/42878904613) falló en los tres OS en un **test nuevo mal configurado**: fixture OTLP de profundidad superior al maxDepth=40. El parser produjo correctamente `EvidenceFormatError: JSON nesting depth exceeded (40)`; no fue fallo de código de producción. Se actualizó el test para comprobar el rechazo predeterminado y la truncación con maxDepth=128 en un caso separado. Las siguientes ejecuciones deben ser verificadas en el SHA exacto final. No se declara CI PASS antes de comprobarlo.

## 10. CI/CD, rulesets, releases
Ruleset de `main` activo: squash-only, historia lineal, controles de review y jobs requeridos `Verify (ubuntu-latest)`, `Verify (windows-latest)`, `Verify (macos-latest)`. `strict_required_status_checks_policy=false`: no se elimina la necesidad de `main` / provenance guard. Ruleset de tags `v*` bloquea actualización y borrado, con bypass owner. CI realiza `npm ci --ignore-scripts`, compila, cobertura, audit de dependencias de producción, brand/screenshots gates, VSIX e instalación real Linux. Publish usa OIDC en registries y genera GitHub Release **después** de ambas publicaciones con checksum del mismo VSIX. La política exige `squash merge` de PR con head exacto y tree idéntico al merge. No se modifican políticas ni se hace merge.

## 11. Rendimiento, resiliencia, UX/DX y documentación
- Riesgo de bloqueo temporal: parser síncrono en Extension Host dentro de límites 8 MiB, sin cancelación intraarchivo; pendiente.
- Respuestas externas acotadas por 5 segundos, 512 KiB y sin redirect; no hay cola de background ni telemetry.
- Webview usa diseño central, navegación por teclado/forced-colors/reduced-motion en CSS, pero falta QA manual lector de pantalla y flujo remoto.
- Capturas antiguas son reales del VS Code Electron/Linux con fixture sintético; la versión 0.2.0 incorpora dos nuevas vistas. **Los PNG nuevos solo son evidencias cuando CI los genera y versiona.**

## 12. Contradicciones código/CI/docs
- `docs/ARCHITECTURE.md` fue redactado como MVP sin hipótesis/confirmación, pero el core ya contiene `evaluateVerification`.
- README heredado llamaba `0.1.2` próxima candidata aunque existe release publicado.
- CI de captura tenía nombre de rama del PR histórico: la existencia de cuatro PNG hacía que el camino de escritura no se ejercitara.

## 13. Roadmap con Definition of Done
Ver [UPGRADE_ROADMAP_V0.2.0.md](UPGRADE_ROADMAP_V0.2.0.md). Fases: P1 de integridad y causalidad; P2 de parsing y rendimiento; UI/adapters; QA adversarial; release/contracts/README; capturas reales + verificación completa sobre HEAD final. No reemplazar features válidas por rediseños.

## 14. Matriz de riesgos / release
| Condición | Gate | Política |
| --- | --- | --- |
| P1 de integridad/correlación sin fix reproducible | Bloqueante | NO APTO |
| Required jobs Linux/Windows/macOS no success exact HEAD | Bloqueante | NO APTO |
| Screenshot v0.2.0 inexistente o de render simulado | Bloqueante para README anunciado | NO APTO |
| VSIX instalado no pasa host smoke | Bloqueante | NO APTO |
| Sin pruebas live Sentry/Grafana, remote hosts, a11y manual | Riesgo explícito | APTO CON RIESGOS si otros gates PASS |
| Dependencias de desarrollo advertidas sin exploit runtime confirmado | WARN con clasificación | No convertir automáticamente en FAIL |

## 15. Limitaciones
Auditoría sin ejecución local independiente ni acceso a sistemas de producción; no se inspeccionaron binarios PNG como prueba de interacción manual ni se midieron accesibilidad real o performance de grandes casos de usuario. No existe autorización para pentest destructivo. Los hallazgos de manipulación externa suponen input potencialmente hostil, no un ataque reproducido contra terceros.

## 16. Recalificación potencial
Si P1/P2, tests, capturas y smoke de release cumplen DoD, **potencial orientativo 83–88/100**, sin garantía. El riesgo de ejecución síncrona, benchmarks reales, protección física de archivos y claims manuales de RCA impide afirmar 95–100 o “Enterprise AAAAA”.

## 17. Conclusión
La actualización 0.2.0 concentra mejoras en contratos comprobables sin modificar la naturaleza local-first ni incorporar infra innecesaria. El PR queda para revisión del owner, CI por SHA exacto y eventual squash merge. Publicación automática solo después de una fusión autorizada y passing release-governance. Todo resultado posterior debe documentarse por número de ejecución, estado, fecha y SHA.
