# Vestigivo RCA — Threat model STRIDE (pre-release)

**Alcance:** extensión VS Code local-first, Evidence Parser, Incident Case Studio, webview central, Git read-only y proveedores Sentry/Grafana Cloud **opcionales**. Actualizado: 2026-11-08, PR #3 Draft. **Revisión técnica interna, no pentest independiente ni aprobación final.**

## Activos y límites de confianza

| Activo / frontera | Origen no confiable | Salida / permisos | Controles implementados | Riesgo residual |
|---|---|---|---|---|
| Archivos locales elegidos | JSON, JSONL, NDJSON, OTLP JSON; rutas y contenido hostiles | In-memory observations, fuentes con SHA256 | Selector explícito, UTF-8 fatal, 8 MiB/10K por defecto, profundidad y longitud acotadas, sanitización | Parseo síncrono hasta el límite; cancelación a mitad del parseo aún pendiente |
| Extension Host ↔ Webview | Mensajes UI/DOM, payloads de logs y respuestas externas | Render central y comandos con permiso | CSP nonce, `connect-src 'none'`, textContent, allowlist y validaciones de mensajes, sin HTML dinámico | QA de navegador, XSS y accesibilidad real incompletos |
| Case Store ↔ disco local | JSON persistido alterable/corrupto, filenames | GlobalStorage, export explícito | Versionado, cuotas, archivo temporal + rename, UUID, control de correspondencia ID/archivo, campos raíz permitidos, verificación RCA validada | Sin cifrado propio, protección física depende del SO/VS Code; no hay prueba de autenticidad ante manipulación deliberada |
| Git ↔ workspace | Repositorio con historial/mensajes hostiles y configuración local | Git CLI read-only | Workspace trust, consent modal, `execFile` sin shell, argumentos fijos, timeout, maxBuffer, pager deshabilitado | CLI Git instalado/entorno local no plenamente aislado |
| SecretStorage ↔ proveedores | Token, endpoint, respuesta JSON | Red HTTPS con opt-in por lectura | SecretStorage, allowlist de hosts oficiales, GET, redirect=error, 5 s timeout, 512 KiB, cancelación anterior al request, desconexión explícita | Credenciales live y contratos reales sin verificar; TLS/DNS suministrados por runtime del SO |
| Reportes / portapapeles | Observaciones con PII, Markdown injection | Archivos elegidos por usuario | Redacción best-effort, escape Markdown, límite de 2M caracteres en export Markdown | No garantiza eliminación total de PII; exportado queda bajo custodia del usuario |
| CI / VSIX | Dependencias, artefactos, runners | VSIX privado, evidencias de checks | `npm ci`, SHA del VSIX, auditoría runtime, actions SHA pinned, sin publish workflow | SBOM, licencias, cadena de suministro y VSIX instalado sin cerrar |

**Flujo permitido:** usuario selecciona datos → validación/normalización local → correlación exacta (no causal) → consulta/exportación explícita. La única salida de red propia es lectura HTTPS de proveedores después de conectar **y autorizar cada solicitud**. Sin telemetry propia, sin envío de archivos, sin LLM ni remedición automática.

## Matriz STRIDE

| Amenaza | Ejemplo de ataque | Mitigación / test | Estado |
|---|---|---|---|
| **S — Spoofing** | Mensaje webview falsificado / origen proveedor malicioso | Tipos y longitudes de acciones; validación de proveedores con HTTPS y hosts permitidos; estado confiable es el Extension Host | Mitigado parcialmente; falta fuzz de mensajes |
| **T — Tampering** | Caso local modificado para insertar `CONFIRMED` o metadatos secretos | `loadCase` valida esquema, hipótesis, fingerprint, ID y gates; allowlist de propiedades raíz; rechaza estados inconsistentes | Mitigado contra inconsistencias, **no** contra atacante que reconstruya campos coherentes; no firma criptográfica |
| **R — Repudiation** | Cambios de notas, bookmarks o planes no rastreados | Auditoría acotada a 500 eventos, IDs y timestamps; modificación voluntaria en archivo no se puede atribuir | Parcial |
| **I — Information Disclosure** | Bearer/PII en logs, URL con token, export Markdown, credencial en consola | Redacción anidada best-effort, `SecretStorage`, no token en query, HTML seguro, consentimiento externo, export explícito | Heurística no cubre secretos arbitrarios ni identificadores desconocidos |
| **D — Denial of Service** | JSON profundo, 100K+ eventos, respuesta HTTP infinita, reportes excesivos | Límites de bytes/profundidad/eventos, streaming HTTP con corte, deadline, export Markdown fail-closed, paginación UI 100 registros | El parseo síncrono todavía puede bloquear temporalmente; falta medir scroll/paint |
| **E — Elevation of Privilege** | Log inyecta comando, URL externa, script o instrucciones falsas | Datos nunca se ejecutan; CSP; comandos Git de lectura; planes RCA manuales, sin ejecutor ni shell | Falta sandbox OS y revisión adversarial independiente |

## Política de causalidad y regresión

`OBSERVED`, `CORRELATED` y `HYPOTHESIS` no son prueba causal. El estado `CONFIRMED` requiere test, baseline comparable, intervención controlada declarada, múltiples repeticiones y evidencia explícita; resultado acotado a **una afirmación**, no al incidente entero. La clasificación `INTRODUCED_OBSERVATION` distingue `PRE_EXISTING_OBSERVATION`, `ABSENT_OBSERVATION`, `NOT_COMPARABLE` e `INCONCLUSIVE`; errores de timeout/flaky son inconclusos. Una planilla manual es `PLANNED`, **nunca** equivale a ejecución ni confirmación. Estas declaraciones/manual flags no autentican la validez física de los checks.

## Gates y evidencia

- Seguridad de runtime: `npm audit --omit=dev --audit-level=high`; último PASS auditado en [run #42500013718](https://github.com/Drako01/vestigivo/actions/runs/42500013718). Vulnerabilidades de `devDependencies` requieren clasificación individual por exposición.
- Tests deterministas de parsers, correlación y validación RCA, contaminación de prototipos, redacción y rutas no confiables: CI PR #3.
- Pruebas de pre-cancelación de proveedor, hipótesis persistidas y campos extra: incorporadas después del run anterior y **requieren PASS del HEAD actualizado**.
- Límites: import 8 MiB, caso 10.000 observaciones, 20 casos, máximo 5 fuentes por selector, HTTP proveedor 512 KiB.
- **PENDIENTE/BLOCKED:** pen test, fuzz/property-based sistemático, mutation testing, monitor de egress real, pruebas live autorizadas, pruebas gráficas Windows/macOS/WSL/SSH/Containers, QA teclado/foco/screen reader, cancelación de parseo en curso, SBOM/licencias y clearance marca.

## Política de despliegue y autoridad

No se ejecutan scripts de terceros ni remediaciones destructivas, ni commits Git, ni lectura remota sin consentimiento. No publicar, fusionar, abrir visibilidad del repositorio ni habilitar publicación automática. El propietario conserva la aprobación final. Cualquier riesgo P0/P1 propio confirmado bloquea el release.
