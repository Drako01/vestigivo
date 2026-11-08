# Vestigivo RCA — Release readiness

Corte 2026-11-08. **NOT READY FOR MERGE / NOT READY FOR PUBLISH.** PR [#3 Draft](https://github.com/Drako01/vestigivo/pull/3), repo privado, destino `main`.

**Último SHA de código probado:** `e08deb1f17d33e470fa78fb22931bce2feb7929e`; [CI PASS #42500482525](https://github.com/Drako01/vestigivo/actions/runs/42500482525). Commits de documentos posteriores: no cambian fuente ejecutable.

| Dimensión | Evidencia | Estado |
|---|---|---|
| Main / Draft PR | Sin merge, sin publish, repo sigue privado | PASS |
| Identidad | Símbolo SVG, PNG 128/256 alfa, icono Activity Bar monocromático | PARTIAL: QA humana 16–256 px falta |
| Compilación | TS strict, npm ci, empaquetado | PASS |
| Pruebas de core | **45/45 tests**, 0 fallos | PASS (alcance instrumentado) |
| Cobertura core | **96,66% líneas / 87,61% ramas**, meta 85/80 | PASS |
| RCA seguro | Plan manual, estado `PLANNED`, verificación persistida consistente, outcomes conservadores | PARTIAL: ciclo completo verificable aún falta |
| UX filtros / navegación | Timeline fecha UTC, trace/request exactos, paginación 100, editor de planes central | PARTIAL: QA visual real pendiente |
| Git / providers | Git opt-in sin shell; HTTPS allowlist/SecretStorage/cancelación y mocks | PARTIAL: live QA y monitor egress faltan |
| Hardening | STRIDE, redacción, límites y tests adversariales | PARTIAL: fuzz/mutation/auditoría independiente pendientes |
| Runtime dependencies | `npm audit --omit=dev --audit-level=high` PASS | WARN: falta inventario dev/licencias |
| Benchmark core | [Run #42500482525](https://github.com/Drako01/vestigivo/actions/runs/42500482525), 1K/10K/100K, P50/P95/RSS | PASS (core sintético) |
| Rendimiento Webview | 100 registros por página, sin medición de paint/scroll | BLOCKED |
| Extension Development Host Linux | Activación, tab central, caso roundtrip y comando Activity Bar | PASS (solo scope probado) |
| UX real/a11y | Clic físico, temas, teclado total, lector, ES/EN, screenshots | BLOCKED |
| Compatibilidad | Windows/macOS/WSL/SSH/Dev Containers sin ejecución | BLOCKED |
| VSIX candidato | 0.1.0, 26 archivos, ~54,36 KB, SHA-256 verificado | PARTIAL: falta instalar paquete y smoke real |
| Merge integrity | PR full-diff CI; sin verificar reglas de SHA integrado | BLOCKED |
| Legal/autorización | Clearance marca, aprobación de merge/publicación | OWNER BLOCKED |

**VSIX SHA-256**: `ba580db5de370ffd647fff938875f3fc54e900b4ddd27dfbd107edd01bc053a9` (CI #42500482525).

**Rendimiento 10K en runner Linux/Node 22**: parseo P50 243,676 ms / P95 378,035 ms; export Markdown P50 845,230 ms / P95 1071,101 ms; RSS final 208,6 MB. No es benchmark del Webview ni SLA cross-platform.

**Fases completas: 0/7.** El checklist técnico [ENTERPRISE_AAAAA_CHECKLIST.md](ENTERPRISE_AAAAA_CHECKLIST.md), la especificación [maestra](VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md), la [evidencia de aceptación](ACCEPTANCE_EVIDENCE.md) y [THREAT_MODEL.md](THREAT_MODEL.md) prevalecen sobre cualquier resumen.

Se requieren pruebas reales y revisión del propietario antes de marcar Ready for Review. **No merge, no release, no marketplace, no Open VSX, no cambio de visibilidad.**
