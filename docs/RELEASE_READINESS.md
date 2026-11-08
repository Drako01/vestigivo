# Vestigivo RCA — Release readiness

Corte 2026-11-08. **NOT READY FOR MERGE / NOT READY FOR PUBLISH.** PR [#3 Draft](https://github.com/Drako01/vestigivo/pull/3), repo privado, destino `main`.

**Último SHA de código probado:** `c534098b3d40b42d25374e2810e0e8562c07004b`; [CI PASS #42501342938](https://github.com/Drako01/vestigivo/actions/runs/42501342938). Commits de documentos posteriores: no cambian fuente ejecutable.

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
| Compatibilidad | Linux/Windows/macOS core+package PASS; Host Linux/Windows PASS; macOS Host ENOENT/exit -2 | PARTIAL / macOS Host WARN |
| VSIX candidato | 0.1.0, 26 archivos, ~54,36 KB; **instalación en perfil aislado y Host sobre bits empaquetados Linux PASS** | PARTIAL: faltan activación natural sin devPath, perfiles Windows/macOS, reinicio/UX real |
| Merge integrity | PR full-diff CI; sin verificar reglas de SHA integrado | BLOCKED |
| Legal/autorización | Clearance marca, aprobación de merge/publicación | OWNER BLOCKED |

**VSIX Linux SHA-256**: `b12ff3ce3c7705b5323a4e607cb25d8c62adf8127fe63bc7c69bf07ad1be7a6e` (CI #42501342938).

**Rendimiento 10K en runner Linux/Node 22**: parseo P50 243,676 ms / P95 378,035 ms; export Markdown P50 845,230 ms / P95 1071,101 ms; RSS final 208,6 MB. No es benchmark del Webview ni SLA cross-platform.

**Fases completas: 0/7.** El checklist técnico [ENTERPRISE_AAAAA_CHECKLIST.md](ENTERPRISE_AAAAA_CHECKLIST.md), la especificación [maestra](VESTIGIVO_RCA_PROMPT_MAESTRO_ENTERPRISE_AAAAA.md), la [evidencia de aceptación](ACCEPTANCE_EVIDENCE.md) y [THREAT_MODEL.md](THREAT_MODEL.md) prevalecen sobre cualquier resumen.

Se requieren pruebas de clic físico, accesibilidad y revisión del propietario antes de marcar Ready for Review. **No merge, no release, no marketplace, no Open VSX, no cambio de visibilidad.**


Checkpoint empaquetado [CI #42501342938](https://github.com/Drako01/vestigivo/actions/runs/42501342938): `PACKAGED VSIX INSTALL PASS` y `PACKAGED VSIX HOST PASS` en Linux. El test ejecuta el directorio instalado vía devPath; **no equivale a prueba de UI física ni activación automática**. Mac Host registra `ENOENT` pese a job verde. Documento sincronizado con el [checklist](ENTERPRISE_AAAAA_CHECKLIST.md).


## Checkpoint — 0.1.1: Public repository and Open VSX OIDC (2026-11-08)

- **OWNER ACTION PENDING VERIFICATION:** the owner decided to make `Drako01/vestigivo` public. Last queried repository visibility was still `private`; do not claim it is public until GitHub reflects the change. A visibility audit must precede any release.
- **IMPLEMENTED IN DRAFT:** `.github/workflows/publish.yml` now uses OIDC for **both** registries (`marketplace` and `open-vsx`, both with `id-token: write`); no PAT fallback. Open VSX job explicitly clears `OVSX_PAT` and uses `--trusted-publishing`.
- **BLOCKED:** Register Open VSX Trusted Publisher `Drako01/vestigivo`, workflow `publish.yml`, environment `open-vsx` after public visibility propagates; confirm Marketplace OIDC policy and protected environments. The legacy PAT secret should be deleted after OIDC is confirmed.
- PR remains Draft. No merge, release or publication of `0.1.1` was triggered.

## Checkpoint — Trusted Publishers + macOS Host (2026-11-08)

**OWNER CONFIRMED:** los dos Trusted Publishers fueron configurados en Visual Studio Marketplace y Open VSX. El repositorio ahora es público; `main` no se modificó.

**CI VERIFIED:** [run #42506224026](https://github.com/Drako01/vestigivo/actions/runs/42506224026), SHA `4feca58c7c7e4376bd5f4d6b012e1d74e33f07de` — Linux, Windows y macOS verde; macOS Extension Host **PASS bloqueante** tras actualizar `@vscode/test-electron` a 3.1.0, 45/45 tests y cobertura core 96,66 % / 87,61 %. Linux VSIX 0.1.1 instalado y ejecutado en perfil aislado (sin interacción física). Los warnings históricos de macOS son obsoletos para este SHA.

**UNVERIFIED:** ambos canjes OIDC reales de `0.1.1` tras merge; configuración/restricciones de los environments inspeccionadas por API; screenshots auténticas, QA UX/a11y físico, integraciones live y DoD restante.

**DECISIÓN:** sigue **NOT READY FOR MERGE / PUBLISH**, aunque las políticas de identidad y compatibilidad nativa básica están desbloqueadas.

## Checkpoint — Capturas reales integradas (2026-11-08)

- **PASS — Evidencia visual real:** 4 PNG de 1440×900 capturados desde el VS Code Electron Extension Development Host en Linux, usando fixture sintético y sin credenciales. [Capture run #42507835267](https://github.com/Drako01/vestigivo/actions/runs/42507835267); `media/screenshots/`.
- **PASS — Documentación:** README inglés y guía española incluyen galería auténtica, captions, limitaciones y atribución ArmoTuSitio.
- **GATE IMPLEMENTADO:** `npm run screenshots:verify` valida en CI las 4 imágenes PNG, dimensiones, enlaces, pesos, hashes distintos y fixture sintético.
- **MANTENER ABIERTOS:** pruebas visuales físicas multiplataforma y accesibilidad, credenciales live, streaming, capacidades pendientes del prompt maestro y validación OIDC real tras merge. La captura genuina no equivale a completar toda la calidad AAAAA.
- **FINAL CI:** esperar PASS sobre el último HEAD antes de aprobar merge. No se ejecutó ningún publish.
