# Upgrade roadmap — Vestigivo RCA v0.2.0

**Estado:** implementación propuesta en [PR #5](https://github.com/Drako01/vestigivo/pull/5), derivado de `main@90f518f0b5c2ad40e156fe5eb376add4ffd49513` (v0.1.2). **Objetivo:** elevar confiabilidad y auditabilidad sin reescribir la extensión ni romper los contratos existentes.

La auditoría completa y la nota provisional de baseline figuran en [AUDITORIA_TECNICA_V0.2.0.md](AUDITORIA_TECNICA_V0.2.0.md). Los checks solo cuentan como PASS cuando GitHub confirma `success` en el HEAD final; un check verde anterior no se reutiliza para un commit posterior. El owner conserva la decisión de merge/release.

## Fase 0 — Preservar inmutabilidad y relaciones de evidencia (P1)

**Archivos:** `src/core/case.ts`, `test/upgrade-020.test.ts`.

- [x] Reimportar un mismo observationId sin sobrescribir su contenido original.
- [x] Rechazar colisiones entre ID de fuente y SHA-256 declarado.
- [x] Enforzar máximo de 100 fuentes antes de cambiar el caso.
- [x] Rechazar observaciones duplicadas en JSON de caso reabierto.
- [x] Rechazar provenance.sourceId inexistente, provenance.importId incoherente y bookmarks sin evidencia real.
- [x] Evitar que `duplicateCase` exceda el máximo del título (180).

**DoD:** tests positivo/negativo con caso válido, reimportación repetida, colisión, presupuesto de fuentes y referencias corruptas. **Rollback:** revert de commits `fix(case)` y test asociado; casos previos no se reescriben en masa. **Riesgo residual:** un archivo JSON y sus hashes pueden falsificarse coherentemente; no se ofrece firma criptográfica.

## Fase 1 — Contratos RCA e importación hostil (P1/P2)

**Archivos:** `src/core/verification.ts`, `src/core/parser.ts`, `src/core/correlate.ts`, `test/upgrade-020.test.ts`.

- [x] Mantener `INCONCLUSIVE` si baseline y current comparten `versionHash` aun cuando los flags manuales indiquen intervención.
- [x] Aplicar el mismo gate al loadCase de hipótesis persistidas.
- [x] Respetar `maxDepth=40` como rechazo fail-closed de JSON excesivamente anidado.
- [x] Truncar atributos OTLP con el límite propio aun si se configura `maxDepth` mayor.
- [x] Validar fechas calendario imposibles sin normalización accidental.
- [x] Limitar diagnósticos de JSONL corrupto a 49 mensajes concretos y resumen, conservando estado `PARTIAL`.
- [x] Cambiar ascenso recursivo/repetitivo de spans por resolución iterativa memoizada.

**DoD:** `npm run check` pasa los casos de 2200 spans, profundidad predeterminada/extendida, 600 líneas JSONL inválidas y RCA con versiones iguales/distintas, manteniendo suites anteriores. **Rollback:** revert aislado por módulo. **Riesgo residual:** el parse principal sigue siendo síncrono en Extension Host; se deberá medir p95 de apertura/importación y de scroll con cargas representativas antes de imponer SLO.

## Fase 2 — Integración, consentimiento y UX de diagnóstico

**Archivos:** `src/ui/controlCenter.ts`, `src/adapters/providers.ts`.

- [x] Reportar observaciones efectivamente aceptadas frente a cantidad parseada/excluida.
- [x] Continuar fuentes independientes tras un error local y mostrar `PARTIAL` o `ERROR` cuando corresponda.
- [x] Revalidar SHA-256 del archivo original antes de abrirlo desde una observación.
- [x] Revalidar credenciales recuperadas de SecretStorage, sin exponer tokens en logs.
- [x] Disponer listener de mensajes al cerrar la webview y panel de VS Code tras un fallo de lectura de HTML.

**DoD:** compilación TypeScript estricta, integración Linux VSIX/Extension Host y ausencia de regresiones en importación, manejo de casos, proveedores opt-in y navegación. **Rollback:** revert por adapter sin alterar datos persistidos. **Riesgo residual:** error visual/renderer y accesibilidad no sustituyen tests manuales.

## Fase 3 — Release seguro y evidencia en CI

**Archivos:** `.github/workflows/ci.yml`, `scripts/verify-readme-screenshots.cjs`, `test/release-contract.test.ts`, `package.json`, `package-lock.json`.

- [x] Preparar versión estable `0.2.0` idéntica en manifest, lock root y contrato de release.
- [x] Mantener required checks Linux, Windows y macOS, y checks de cobertura `85 %` líneas/`80 %` branches del core.
- [x] Mantener build reproducible, VSIX instalado y checksum.
- [x] Mantener publish de VSIX único por OIDC con GitHub Release posterior a ambos registries.
- [x] Migrar el job visual al PR actual sin permisos de escritura en `main`.
- [ ] Confirmar `success` de required checks en el **último SHA**, no en un SHA anterior.
- [ ] Confirmar que el commit del merge conserva el mismo tree aprobado por CI para el release guard.

**DoD:** revisión explícita de checks y SHA final. Si `main` avanzó, actualizar PR/reejecutar según la gobernanza; no forzar publish o saltarse gates. **Rollback:** detener merge; si un release ya se publicó, usar un patch nuevo, nunca alterar tags `v*` ni assets existentes.

## Fase 4 — README, capturas genuinas y aceptación

**Archivos:** `README.md`, `CHANGELOG.md`, `media/screenshots/*.png`, `test/host/suite/index.ts`, `docs/*`.

- [x] Documentar cambios de 0.2.0 con límites y estados de confianza explícitos.
- [x] Preservar screenshots previos genuinos del VS Code Electron y ampliar captura desde fixture sintético.
- [x] Incorporar nuevas vistas Evidence (fingerprints/provenance) y Report (preview redactado).
- [x] Verificar que las 6 capturas sean PNG distintos, 1440×900, trazables al harness, no renderizaciones inventadas.
- [x] Registrar auditoría independiente con puntaje inicial y hallazgos.
- [x] Crear roadmap con criterios de aceptación y riesgos residuales.
- [ ] Verificar de nuevo README, origen de capturas y `screenshots:verify` en CI del HEAD final.

**DoD:** README visible en GitHub con 6 imágenes versionadas, `screenshots:verify` exitoso en run exacto, documentación del release y notas sin afirmaciones de disponibilidad futura como hecho. **Rollback:** revert de screenshots/documentación vinculada si el harness no prueba autenticidad.

## Evaluación final y riesgos fuera de 0.2.0

| Control | Resultado requerido | Evidencia |
| --- | --- | --- |
| Core TypeScript/tests/coverage | PASS Linux/Windows/macOS en mismo SHA | Jobs `Verify (...)` |
| Smoke real del paquete VSIX | PASS | Step `Install actual VSIX into isolated profile` |
| Capturas auténticas | 6 PNG versionados + verifier PASS | `media/screenshots/`, step `Verify real screenshots` |
| Supply chain | Runtime audit PASS, dev advisories clasificadas | `npm audit --omit=dev` |
| Integridad release | squash PR + tree igual a PR head + exact-green CI | `scripts/release-guard.cjs` |
| QA avanzada remota / Sentry/Grafana live / lector pantalla | NO VERIFICADO | Riesgo residual, no atribuir PASS |

**No ampliar automáticamente el alcance** a cambios de CI gobernanza, servicios de observabilidad, workers, streaming remoto o automatización RCA sin evidencia específica. Priorizar correcciones incrementales compatibles (KISS, DRY, YAGNI, SOLID). Ninguna nota nueva se considera ganada hasta comprobar calidad y estabilidad del artefacto final.
