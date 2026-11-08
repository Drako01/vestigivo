# VESTIGIVO RCA — PROMPT MAESTRO DE IMPLEMENTACIÓN ENTERPRISE AAAAA

**Repositorio:** `Drako01/vestigivo` — https://github.com/Drako01/vestigivo  
**Producto:** **Vestigivo RCA** — *Incident Intelligence & Root Cause Analysis*  
**Publisher:** `armotusitio`  
**Slogan:** *Every incident leaves evidence.*  
**Naturaleza:** mandato de implementación integral con verificación; **no** es un pedido de redactar otro plan.  
**Alcance:** fases 0–6 del roadmap; todas las capacidades previstas, con evidencias y limitaciones explícitas.  
**Regla de lanzamiento:** preparar para publicar, **pero no publicar, fusionar ni volver público el repositorio** sin aprobación inequívoca del propietario.

---

## 0. ROL, OBJETIVO Y CONTRATO DE EJECUCIÓN

Actuá como un equipo coordinado de ingeniería de producto de máxima exigencia: **Principal Software Architect, Senior VS Code Extension Engineer, Backend/SRE, Observability Engineer (OpenTelemetry), Security Engineer/Red Team, QA Automation Engineer, Accessibility/UX Engineer y Release Engineer**. La exigencia técnica equivale a una revisión de nivel Microsoft/Google/AWS, sin fingir afiliaciones ni certificaciones.

**Tu trabajo es IMPLEMENTAR el producto**, no limitarte a auditar, responder con recomendaciones, crear documentación vacía o marcar checkboxes sin evidencia. Tenés autorización para crear archivos, modificar código, pruebas, documentación, workflows y commits **en una rama de trabajo** del repositorio indicado. No tenés autorización para hacer merge, publicar extensiones, crear releases públicos, enviar datos de usuarios a terceros, cambiar visibilidad del repositorio ni habilitar deployments reales.

El objetivo es entregar una **versión candidata completa y funcional**, instalada mediante VSIX en un Extension Development Host auténtico, que permita investigar incidentes con evidencia reproducible, y que mantenga el contrato de verdad:

- `OBSERVED`: dato realmente presente en un registro/span o resultado de una comprobación con procedencia.
- `CORRELATED`: relación por identificador compartido o tiempo, con reglas explícitas; **no implica causalidad**.
- `HYPOTHESIS`: explicación plausible pendiente de verificación; nunca se presenta como hecho.
- `CONFIRMED`: **afirmación precisa** respaldada por prueba/reproducción causal comparable, no solo por logs, IA, correlación, una captura o un check verde.
- `INCONCLUSIVE`: evidencia ausente, incompleta, no comparable o verificación impedida.

**Nunca atribuyas automáticamente una causa raíz a un commit, una petición, una traza, un despliegue o una respuesta de IA.**

### Condiciones inquebrantables

1. **KISS, DRY, YAGNI, SOLID, Clean Code**, arquitectura modular, mínimo acoplamiento, separación de responsabilidades, interfaces pequeñas, errores explícitos, TypeScript estricto, bajo consumo de recursos y mantenibilidad.
2. **Conservar el branding APROBADO**: el logo correcto es el **grafo de nodos azules + ramal violeta + lente circular turquesa + nodo naranja**. **NO** volver al diseño alternativo en forma de V/W. Nombre visual `VESTIGIVO RCA`, descriptor `INCIDENT INTELLIGENCE / ROOT CAUSE ANALYSIS`. Identificador técnico y repositorio siguen siendo `vestigivo`.
3. **Transparencia real**: cualquier imagen o tarjeta de esquinas redondeadas conserva canal alfa `0` fuera de los bordes. SVG sin matte rectangular, PNG RGBA; Activity Bar monocromática, transparente y controlada por el tema.
4. **Control Center en el área CENTRAL del editor**, iniciado con un único clic sobre el icono de Activity Bar: sin vista lateral estrecha como producto principal ni flujo de dos clics.
5. **Local-first, offline-first, privacy-by-default**. Nada de telemetría ni envío implícito de código/logs a IA o proveedores. Conexiones externas estrictamente opt-in, con autorización acotada y revocable.
6. **No ejecutar scripts arbitrarios ni comandos de repositorios**, remediaciones, Git writes, reinicios o despliegues. Solo comprobaciones/lecturas explícitamente permitidas; para verificaciones opt-in, mostrar el comando exacto, superficie de ejecución, riesgo y permiso.
7. **No sobreingeniería**: no crear bases de datos, microservicios, servicios en la nube, bus de eventos, frameworks propios o agentes permanentes si un módulo y almacenamiento local bastan.
8. **No romper nada existente**. Implementaciones aditivas; si se necesita un cambio incompatible, justificarlo, migrarlo y probarlo.
9. **Economía de pruebas y tokens**: no repetir suites pesadas no afectadas; ejecutar pruebas unitarias focalizadas durante el desarrollo y suites completas únicamente en gates/cambios transversales/release candidate. Reutilizar resultados CI verificables referidos al SHA exacto; no decir PASS basándose en ejecuciones anteriores o de otra revisión.
10. **Honestidad operativa**: jamás inventar resultados, coberturas, análisis de seguridad, benchmarks, conexiones reales, certificados o capturas. Distinguir `PASS`, `FAIL`, `WARN`, `SKIP`, `BLOCKED`, `INCONCLUSIVE`.
11. **NO MERGE, NO PUBLISH, NO PUBLIC VISIBILITY**, aunque la candidata esté perfecta; espera autorización explícita del propietario para esas acciones.
12. **No realizar cambios en otros repositorios** (`probato-pr`, `indizivo`, `orquestivo`, `saturivo`, `noditrivo`) a menos que el propietario lo solicite. Son referencias de buenas prácticas, no bases que deban copiarse ciegamente.

---

## 1. PREVUELO OBLIGATORIO: RECUPERAR LA VERDAD DEL REPOSITORIO

1. Abrir `Drako01/vestigivo` usando el acceso GitHub autorizado. Confirmar que permanece **privado**.
2. Verificar el estado del **PR #1** y de `main`. El usuario informó que **él mismo lo fusionará**: no asumir que ya se fusionó. Si el PR #1 sigue abierto, trabajar en rama de integración basada en su HEAD o coordinar la base sin modificar ese PR ni hacer merge; si ya está fusionado, partir de `main` actualizado. Conservar el logo corregido del commit `b93cfbdefa08e786dbfac7b7e66685c84fea73c1` o su descendiente, verificando el contenido real.
3. Leer completamente y tratar como fuentes de requisitos, no como prueba de implementación:
   - `README.md`
   - `docs/ROADMAP.md`
   - `docs/IMPLEMENTATION_CHECKLIST.md`
   - `docs/PRODUCT_VISION.md`
   - `docs/ARCHITECTURE.md`
   - `docs/ENGINEERING_STANDARDS.md`
   - `docs/THREAT_MODEL.md`
   - `docs/BRAND_IDENTITY.md`
   - `docs/BRAND_TRANSPARENCY.md`
   - `docs/NAMING_DECISION.md`
   - `media/brand/*`
4. Inspeccionar la **estructura real**, estado de compilación, tests, CI, releases y dependencias. El PR #1 auditado contenía identidad y documentos, **no implementación funcional**. No considerar nada implementado sin código y pruebas actuales.
5. Tomar como referencias arquitectónicas, donde corresponda, los repos públicos `Drako01/probato-pr`, `Drako01/indizivo`, `Drako01/orquestivo`, `Drako01/saturivo` y `Drako01/noditrivo` (TypeScript estricto, Workbench, i18n, empaquetado, seguridad de Webview, mocks/fixtures, CI, checklist). Evitar trasladar fallas, deuda técnica o dependencias innecesarias.
6. Crear **UNA rama de implementación y UN Draft PR** hacia `main` para las fases 0–6. Nombre sugerido: `feat/enterprise-aaaaa-incident-intelligence`. Si ya hay una rama/PR apropiado, reutilizarlo sin duplicar trabajo. Commits pequeños y descriptivos; checklist vivo actualizado por fase.
7. Normalizar documentación desactualizada: si una guía describe el logo V/W o asegura funcionalidades inexistentes, corregirla. `README` debe reflejar el producto real, no promesas.
8. Incorporar `docs/ENTERPRISE_AAAAA_MASTER_PLAN.md`, `docs/ENTERPRISE_AAAAA_CHECKLIST.md`, `docs/ACCEPTANCE_EVIDENCE.md`, `docs/RELEASE_READINESS.md` y un mapa de requisitos trazables. No crear documentación redundante; enlazar el roadmap existente.

**Entrega del prevuelo:** inventario preciso `IMPLEMENTED / PARTIAL / MISSING`, SHA y alcance, riesgos P0/P1/P2, tareas por fase y criterios medibles. Ejecutar a continuación sin detenerse para pedir una aprobación intermedia de implementación ordinaria.

---

## 2. FASE 0 — IDENTIDAD Y PRODUCTO (RESOLVER INCONSISTENCIAS Y ACABADOS)

Implementar, verificar y estabilizar la identidad **Vestigivo RCA Dark Forensic Premium**:

- Mantener isotipo aprobado en `media/brand/vestigivo-symbol.svg`; red de cuatro nodos superiores azulados, ramal inferior violeta, lente/anillo turquesa con centro y salida naranja.
- Lockups `vestigivo-lockup-dark.svg` y `vestigivo-lockup-light.svg` con nombre `VESTIGIVO RCA` y descriptor completo, equilibrados tipográficamente, y variantes legibles en GitHub, VS Code, Marketplace.
- `vestigivo-activity-bar.svg`: simplificación **del mismo isotipo**, monocromática con `currentColor`, sin fondo.
- `moodboard.svg`, `tokens.css`, manual de marca, espaciamiento, jerarquía tipográfica y colores coherentes entre sí. Eliminar referencias incorrectas a logo V/W y paletas anteriores.
- Exportaciones PNG finales 128/256px y recursos adicionales realmente necesarios. No distribuir archivos de fuentes. La creación de PNGs debe preservar transparencia y formas.
- **Test de alfa automatizado**: los cuatro píxeles extremos fuera de cada tarjeta redondeada tienen `alpha===0`, centro opaco, composición sobre fondos claro/oscuro/magenta/checkerboard sin halos. Validar reducción a 16, 24, 32, 48, 128 y 256 px.
- `package.json` cuando exista: `displayName: "Vestigivo RCA"`, publisher `armotusitio`, icono PNG optimizado, README y metadatos en español e inglés según política del producto.
- No inventar certificación de marca: búsqueda y clearance formal quedan registrados como paso del propietario, **no marcar como completados por aproximación**.

**DoD Fase 0:** SVG/PNG coherentes con el diseño aprobado, verificaciones reproducibles (alpha, dimensions, legibilidad), README actualizado y capturas de branding trazables. Las capturas reales del producto se hacen **al final de todas las fases**.

---

## 3. FASE 1 — MVP OPERATIVO Y EVIDENCIA LOCAL

### 3.1 Núcleo

Crear extensión VS Code real en TypeScript estricto, con módulos separados: `src/core`, `src/adapters`, `src/application`, `src/ui`, `src/infrastructure` según necesidad real; tests al lado de dominio o en `test/`. No generar capas vacías.

- Activación por comando/Activity Bar, sin carga pesada al iniciar VS Code.
- Importación **explícita** de archivos seleccionados por el usuario: JSON, JSONL, logs estructurados, OTLP JSON `resourceSpans`/`resourceLogs`, atributos tipados y tiempos nanosegundos, con posibilidad de evolución a formatos adicionales. No afirmar soporte binario OTLP Protobuf si no está implementado.
- Parser seguro y determinista: UTF-8, formatos soportados documentados, `maxBytes`, `maxEvents`, `maxLineLength`, profundidad y cardinalidad acotadas, procesamiento incremental/streaming cuando sea razonable, límites de CPU/memoria, cancelación y errores accionables. Diferenciar archivo vacío, inválido, parcialmente importado y no soportado.
- Esquema versionado de `Evidence`, `EvidenceSource`, `IncidentCase`, `Observation`, `Correlation`, `Hypothesis`, `VerificationResult` y `EnvironmentFingerprint`, con migraciones aditivas y validación en boundaries.
- IDs seguros, procedencia exacta (archivo, línea u offset, rango, timestamp, import ID), deduplicación bien definida y normalización de servicio, severidad, traza, span, request, exception, recursos y tiempos.
- Tratar clocks diferentes, timestamps inválidos, nanosegundos, husos horarios, spans fuera de orden, zonas, duplicados, registros incompletos y múltiples servicios. No fabricar información ausente.
- Redacción robusta de secretos **antes de render, persistencia y exportación**; validar tanto cadenas como campos estructurados, atributos y errores. Indicar expresamente redacción de mejor esfuerzo y permitir previsualizar lo exportado.
- Correlación priorizando `traceId` / `spanId` / `parentSpanId` / `requestId` exactos, y eventualmente ventana temporal **siempre etiquetada como correlación débil**, con explicación de metodología y límites. Evitar unir IDs incompatibles o inferir causalidad por tiempo.
- Timeline reproducible, determinista y ordenado con identificación de incertidumbre temporal. Navegación desde evidencia al archivo original, cuando esté disponible.
- Git read-only para workspaces de confianza: commits, ramas y diff/datos relevantes **solo a solicitud**. Repos multi-root y repositorios anidados. Mostrar Git temporalmente separado de causalidad. Git invocado sin shell ni interpolación, con argumentos fijos, timeouts, límites de salida y manejo de permisos.
- Reporte Markdown y JSON **versionado y reproducible**, con procedencia, fingerprints de fuente, redacción, limitaciones, observaciones, correlaciones y lo no verificado. CSV/SARIF solo si aporta valor real, no por checklist.
- Sin almacenamiento implícito de datos brutos en `workspaceState`, `globalState` o logs. Sesión efímera por defecto; almacenamiento persistente opt-in con reglas explícitas.

### 3.2 Primera interfaz

- Clic único en Activity Bar abre **Control Center en pestaña central** (`vscode.window.createWebviewPanel` u opción equivalente compatible), jamás una segunda acción para abrir la vista principal.
- Diseño orientado a tareas: `Overview`, `Import`, `Timeline`, `Evidence`, `Correlations`, `Git Context`, `Report`, `Settings` (ajustar navegación sin inflar la UI).
- Estados visuales Empty / Loading / Partial / Error / Complete / Cancelled / No permission y progreso cancelable.
- Interfaz auténtica, sobria, amigable, profesional; nada de dashboard ficticio ni botones decorativos. Toda acción debe funcionar.
- Tema oscuro/claro/alto contraste, tokens `--vscode-*`, teclado, foco visible, iconos accesibles, ARIA donde aplique, pantallas pequeñas y zoom, reduced motion; i18n ES/EN.
- CSP restrictiva, `webview.cspSource`, nonce, validación de mensajes, sin HTML arbitrario, acceso mínimo a recursos, localResourceRoots acotados; `textContent` para datos no confiables.

**DoD Fase 1:** instalar VSIX real en Extension Development Host, importar fixture JSONL y OTLP, observar eventos y grupos con navegación y provenance, obtener informe redactado, comprobar un clic en icono y verificar ausencia de ejecución externa involuntaria.

---

## 4. FASE 2 — INCIDENT CASE STUDIO, HISTORIAL Y UX PROFESIONAL

Construir una experiencia completa para investigaciones, distinta de un visor genérico de logs:

- `Incident Case` con ID estable, título, servicios afectados, entorno, período, evidencia, hipótesis, estado, conclusiones y limitaciones, con versionado y esquema migrable.
- Crear, guardar, reabrir, duplicar, comparar y archivar investigaciones localmente. Persistencia opt-in, preferentemente en almacenamiento administrado por VS Code, con cuotas, retención, import/export y borrado explícito. Si la confidencialidad no puede garantizarse, no persistir texto sensible sin consentimiento.
- Timeline avanzada: filtros por servicio/severidad/tiempo/trace/request, búsqueda, zoom, agrupación, eventos faltantes, clocks divergentes, bookmarks y selección accesible. No visualización que reordene eventos sin explicar por qué.
- Trace tree padre/hijo con spans huérfanos, ciclos inválidos, múltiples raíces, servicios cruzados, duración, excepciones y links respaldados por IDs reales.
- Navegación a código fuente, Git, errores y evidencia original donde exista mapping válido; si no existe, explicar limitación en lugar de abrir ubicación incorrecta.
- Vista de comparación entre dos sesiones/casos: evidencias nuevas, persistentes, ausentes o no comparables; **ausencia no prueba resolución**.
- Historial y notas del investigador, decisiones y etiquetas auditables localmente, con cambios trazables.
- Accesibilidad profesional en controles, tabla, gráficos, alternativas textuales, estados/errores y navegación solo teclado. No animaciones obligatorias ni gráficos ilegibles.
- Asistente contextual/explicaciones deterministas en lenguaje claro y niveles básico/avanzado, **sin depender de IA**. No añadir IA por defecto.

**DoD Fase 2:** un ingeniero puede abrir una investigación, importar dos fuentes con trazas relacionadas, aislar un fallo, guardar, cerrar VS Code, reabrir la investigación y exportar con estados correctos; los casos se migran sin pérdida entre dos versiones de schema de prueba.

---

## 5. FASE 3 — INTEGRACIONES REALES, OPCIONALES Y SEGURAS

No construir un backend propietario. Preferir adaptadores del lado de la extensión con contrato mínimo, permitiendo investigación local **sin ninguna cuenta**.

### 5.1 OpenTelemetry

- Importación real de OTLP JSON traces/logs y receptor/collector local **opt-in** solamente si puede implementar límites y consentimiento seguros; no levantar listeners ni puertos por defecto. Especificar el transporte soportado (archivo, OTLP/HTTP, etc.) y no afirmar OTLP/gRPC si no existe.
- Asociar `traceId`, `spanId`, `resource`, `scope`, `events`, `links` y atributos tipados correctamente. Respaldar compatibilidad con fixtures oficiales/versionados.
- Si se inicia un receptor local: bind exclusivamente a loopback de forma predeterminada, autenticación o validación de origen cuando corresponda, límites de payload, cuotas y apagado confiable; impedir exposición involuntaria en interfaces públicas.

### 5.2 Sentry y Grafana (opt-in)

- Integraciones de **lectura** con APIs documentadas, scopes mínimos, proyectos/organizaciones elegidos, paginación, filtros, rate limits y mensajes claros ante 401/403/404/429.
- Implementar los casos necesarios para la investigación: buscar incidente/issue/evento, recuperar eventos y campos de correlación disponibles, enlaces profundos y metadatos de servicios. Documentar incompatibilidades según productos y planes de cada proveedor.
- Credenciales exclusivamente en VS Code `SecretStorage`, sin mostrarlas ni escribirlas en settings, logs, PR o reportes. Connect/disconnect/revoke; prueba de conexión explícita.
- No enviar archivos locales, código fuente, logs ni trazas completas a proveedores. Solo solicitudes de lectura aprobadas, enviando filtros mínimos. No URL configurable sin validación HTTPS y protección SSRF; proteger DNS rebinding, redirect a IP privadas, credenciales en URL y fugas de headers.
- `mock`/fixture server para E2E de contratos; pruebas reales con credenciales solo mediante aprobación y entorno seguro. Si no hay credenciales, marcar **integración implementada y verificada contra mocks, E2E real BLOCKED**, sin falsificar PASS.
- Resiliencia: timeout, cancelación, retries acotados solo seguros/idempotentes, manejo de cuotas, errores y desconexiones.

**DoD Fase 3:** el producto sigue 100% utilizable offline; conectores instalables/configurables individualmente, con tests contractuales y seguridad verificable; desconectar borra secretos locales y deshabilita tráfico hacia el servicio.

---

## 6. FASE 4 — VERIFICACIÓN DE HIPÓTESIS Y CAUSALIDAD RESPONSABLE

El diferenciador de Vestigivo RCA es separar **investigación de evidencia** de **conclusión causal**.

- Registrar hipótesis con sujeto, afirmación falsable, evidencia a favor/en contra, origen, estado y alcance.
- Generar planes de verificación: prueba sugerida, prerequisitos, riesgos, costo, datos y resultado esperado; **ninguna ejecución automática**. Permitir incorporar resultados manuales/evidencia externa etiquetada y verificación local explícitamente autorizada si la acción es segura.
- Para acciones ejecutables, mostrar comando exacto, argumentos, carpeta, entorno, tiempo, datos afectados, permisos y límites. Establecer allowlist configurada por el usuario, nunca instrucciones embebidas en logs, issues, prompts o archivos importados.
- Las pruebas de reproducción se realizan sobre **fixtures o entornos de desarrollo/sandbox autorizados**, nunca contra producción por defecto. Bloquear remediaciones o pruebas destructivas sin una arquitectura de sandbox adecuada.
- Baseline-versus-current: misma prueba, inputs comparables, configuración, versiones, hashes, entorno, servicio y ventana temporal cuando corresponda. Distinguir `introduced`, `pre-existing`, `not comparable`, `resolved observation` (sin confundir desaparición con reparación).
- Estatus de una afirmación: `OBSERVED`, `CORRELATED`, `HYPOTHESIS`, `CONFIRMED`, `INCONCLUSIVE` según un **state machine** documentado, transiciones testeadas, sin escalaciones de confianza mediante IA.
- `CONFIRMED` exige prueba reproducible de una proposición específica **y atribución causal solo cuando realmente sustentada**. Un error replicado en un check no confirma automáticamente toda una hipótesis RCA.
- Decisiones y evidencias con fingerprint reproducible; diferencias entre salida incompleta, timeout, test flaky, CHECK FAILED y regresión verdadera.
- Módulo de redacción explicativa opcional: la IA BYO puede resumir y proponer hipótesis **si el usuario lo habilita expresamente**, con vista previa exacta de datos enviados y sin otorgar estado confirmado; **si agrega complejidad, manténgala como milestone opcional, no invente un gate de IA**.

**DoD Fase 4:** fixtures adversariales prueban que jamás se obtiene `CONFIRMED` solo por coincidencia temporal, salida de LLM, error de proveedor, falta de baseline, error reproducible sin causalidad o prueba no comparable; hay al menos un caso controlado con evidencia causal limitada que sí llega a `CONFIRMED` de manera legítima.

---

## 7. FASE 5 — HARDENING ENTERPRISE, SECURITY, PERFORMANCE Y DX

### 7.1 Seguridad y modelo de amenazas

- Actualizar `docs/THREAT_MODEL.md` con STRIDE o metodología equivalente, trust boundaries, data-flow, assets, actores adversarios, mitigaciones y riesgos residuales.
- Pruebas adversariales para JSONL malicioso, JSON profundo/masivo, strings enormes, OTLP inválido, timestamps extremos, Unicode, mensajes con HTML/XSS, ANSI/terminal escape, Markdown injection, prompt injection, path traversal, symlink, SSRF, redirect, DNS rebinding, tokens secretos y logs aparentemente inocuos con PII.
- Datos de entrada son siempre no confiables; no ejecutar código, comandos, macros, URLs ni mensajes como instrucciones.
- CSP estricta y tests; `Webview` no incluye scripts desde CDN ni HTML interpolado con datos externos. No usar 
  `dangerouslySetInnerHTML` o equivalentes.
- Redacción best-effort con pruebas: secretos/token/Bearer/API keys, URL tokens, campos anidados, OTLP attributes, nested JSON, multiline; comprobación en logs, History, UI, exports y capturas.
- Gestión de credenciales en `SecretStorage`; política de telemetry y retención documentadas.
- Dependencies mínimas, lockfile, licencias, `npm audit`, SBOM si resulta útil, hash del VSIX y validación de contenido del paquete; actions versionadas/pinned en SHA cuando existan.
- Una vulnerabilidad de tercero sin exploit claro puede ser `WARN` con justificación; falla por severidad alta y explotabilidad conforme a política documentada. Nunca convertir automáticamente **todas** las advertencias en FAIL sin contexto.

### 7.2 Rendimiento y resiliencia

- Fuentes de 1K/10K/100K eventos o tamaños equivalentes según presupuestos; no exigir meter 100K eventos en memoria si la política limita a menos: evaluar rechazos, truncamiento y streaming.
- Benchmark reproducible: tamaño, memoria pico, P50/P95 de importación, latencia de filtro y scroll, duración de exportación; hardware/OS/Node/VS Code y script incluidos. Usar baseline propia; no inventar números.
- Definir y comprobar presupuestos iniciales razonables bajo hardware común, ajustables por evidencia: archivo importado <=8 MiB por defecto, 10K observaciones visibles por sesión por defecto, tareas cancelables, tiempo de activación bajo y sin freeze prolongado del Extension Host.
- Pruebas con varios archivos, multi-root, local, WSL, SSH y Dev Containers; si un entorno real no existe, `SKIP/BLOCKED` con evidencia y plan, jamás PASS.
- Asegurar que History/Reports y caches tienen límites y políticas de limpieza, corrupt recovery y compatibilidad entre esquemas.

### 7.3 Calidad técnica

- `tsconfig` con `strict`, `noUncheckedIndexedAccess`, prácticas ESLint adecuadas, formato reproducible, límites de tamaño/complexidad razonables, ausencia de ciclo de módulos.
- Unit tests deterministas, integration tests con fixtures y Git fixture repos, contrato de APIs, adversarial/security tests, UI state tests, VSIX manifest smoke y Extension Host E2E real. Evitar snapshots gigantes que no detecten fallas reales.
- **Cobertura objetivo inicial en core:** >=85% líneas y >=80% branches; reportar cifras reales del instrumento elegido, sin hacer que tests frágiles oculten defectos.
- Fuzz/property-based test en parsers, correlator, redactor y state machine con corpus reproducible.
- ES/EN y accesibilidad: contrastes WCAG AA en interfaces reales, teclado sin mouse, tab order, screen reader smoke, dark/light/high contrast, reduced motion y zoom.

**DoD Fase 5:** sin P0/P1 abiertos, tests adversariales ejecutados, límites demostrados, threat model actualizado, matrices reales con SKIP honestos y métricas de rendimiento reproducibles.

---

## 8. FASE 6 — RELEASE ENGINEERING, CI/CD, DOCUMENTACIÓN Y CANDIDATA

### 8.1 CI/CD correcto, sin duplicación

- Workflows de **validación en PR y/o merge_queue**, no repetir innecesariamente exactamente los mismos tests después del merge.
- **Garantizar que el SHA efectivamente integrado es equivalente al SHA validado**: branch protection que exige rama actualizada, merge queue o política equivalente. Si esto no puede configurarse, **NO eliminar la verificación post-merge a costa de la integridad**; documentar la restricción y gate alternativo.
- Pipeline: install reproducible, TS typecheck/lint, unit/integration, security, license, package audit, tests de iconos/transparencia, VSIX smoke; matriz Windows/Linux/macOS para gates razonables, con tests reales de VS Code Extension Host en todos los OS objetivo cuando sea factible.
- Mutation/fuzz/security costosos solo según cambios relevantes o gate de candidata nocturno/manual; no ejecutar todo en cada commit sin necesidad.
- Publicación **deshabilitada por defecto** durante fase privada. Preparar workflow seguro para publicación a VS Marketplace y Open VSX (tokens/OIDC y scopes mínimos), firmado/hash, notas, versionado, tags; activarlo únicamente tras autorización del propietario. No transformar el repositorio a público.
- No incluir claves en código ni logs. Verificar que README e imágenes empaquetadas funcionan antes del release. Generar VSIX reproducible, inventario y checksum.

### 8.2 UX final y contenido público

- README profesional ES/EN (o principal EN + documento ES): origen del problema, valor diferencial, limitaciones honestas, instalación, ejemplos verificables, capturas, permisos, privacidad, seguridad, compatibilidad, licencia MIT, autor/publisher, changelog, troubleshooting y soporte.
- **Capturas reales al final**: usar Extension Development Host auténtico con fixtures de demo aislados, estado real de import/timeline/traces/caso/report/configuración, dark/light y altas resoluciones. No mockear métricas como si fueran reales. Imágenes guardadas en `media/` y referenciadas correctamente.
- Icono Marketplace PNG del símbolo aprobado; equivalencia visual en Open VSX y Marketplace; alpha en esquinas.
- CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, PR template, CHANGELOG, ROADMAP y RELEASE_READINESS actualizados solo si aportan valor; no crear documentación decorativa.
- Calificación de release con tabla completa `PASS/WARN/SKIP/FAIL/BLOCKED/INCONCLUSIVE`, criterios medibles y enlaces a logs/SHAs.

### 8.3 Legal y actos reservados

- Chequear disponibilidad de nombre en fuentes públicas cuando sea posible, pero **validación formal de marca** la realiza/aprueba el dueño. No marcar como aprobada solo con búsqueda web.
- No crear release público, no publicar paquete en Marketplace/Open VSX, no habilitar publish automático, no fusionar y no hacer público el repositorio. Si el término “100%” incluye esos actos, el estado será **READY FOR OWNER APPROVAL**, no “published”.

**DoD Fase 6:** VSIX instalable y verificado, checks medidos, branding y docs consistentes, release candidate funcional, riesgos residuales declarados y Draft PR listo para revisión del propietario.

---

## 9. CRITERIOS DE ACEPTACIÓN MEDIBLES Y PRUEBAS OBLIGATORIAS

No aceptar frases como “funciona perfecto”, “nivel NASA” o “Enterprise AAAAA completo” sin los siguientes resultados:

| Área | Criterio mínimo | Evidencia exigida |
|---|---|---|
| Identidad | Logo aprobado, no V/W; PNG con cuatro esquinas alpha 0 | SVG/PNG + script alpha QA + imagen checkerboard |
| Activación | Clic único en Activity Bar abre la pestaña CENTRAL | Extension Host E2E real + captura final |
| Parseo | Fixtures JSON/JSONL y OTLP logs/traces, con error o truncamiento explícito | Tests positivos/negativos y documentos de formatos |
| Correlación | IDs exactos se unen correctamente; no hay uniones falsas entre IDs distintos | Corpus controlado por trace/request/span |
| RCA | 0 confirmaciones indebidas en corpus adversarial | State-machine tests y reportes de reproducción |
| Seguridad | 0 fallos P0/P1 de alcance propio sin resolver | Threat model + adversarial QA + dependency report |
| Privacidad | Offline funciona; 0 egresos sin consentimiento | Test con red monitor/mocks, revisión de código, consent UI |
| Secretos | Credenciales solo en SecretStorage; redacción de reportes | Tests de filtrado anidado y desconexión |
| Persistencia | Guardar/reabrir/migrar incident case sin pérdida | Tests de esquema versionado y casos reales |
| Conectores | Sentry/Grafana opt-in, lectura limitada y cancelación | Contract tests, mocks; live QA si accesible y autorizado |
| Git | Lectura exclusivamente, trusted workspace, sin shell | Fixture repo + tests seguridad Git |
| UI | Keyboard, tema dark/light/high contrast, ES/EN | E2E + revisión a11y, evidencia de casos |
| Rendimiento | Bench reproducible y budgets definidos/medidos | Informe P50/P95, peak RSS, tiempos, tamaños |
| Calidad | >=85% líneas / >=80% branches **en core** como objetivos explícitos | Coverage report real |
| CI | SHA de merge candidato validado, sin duplicación injustificada | Workflows + branch rules / merge queue documentado |
| Artefacto | VSIX instalable, manifiesto y checksum auditados | Empaquetado + Extension Host real |
| Documentación | README consistente con la versión, capturas reales al final | Links y capturas verificables |
| Lanzamiento | Ningún publish/merge/cambio a público sin autorización | PR Draft y release gate bloqueado |

**Si un criterio no se puede comprobar por carencia de credenciales, hardware, entorno remoto o permisos**, registrar `BLOCKED` o `SKIP`, motivo, impacto y pasos exactos para validarlo. **No** bajar artificialmente el estándar para marcarlo `PASS`.

---

## 10. CÓMO TRABAJAR Y REPORTAR — NO DETENERSE EN EL PLAN

1. Ejecutar **Fase 0 → 6**, implementando código real y pruebas en el mismo Draft PR. Trabajar por commits por subsistema y checkpoints. **No abrir un PR nuevo por fase** salvo impedimento técnico documentado.
2. Mantener `docs/ENTERPRISE_AAAAA_CHECKLIST.md` **actualizado al finalizar cada bloque**, con links a archivos, tests, commits y pendientes. No inventar porcentajes.
3. Mantener `docs/ACCEPTANCE_EVIDENCE.md` y `docs/RELEASE_READINESS.md` con el SHA exacto analizado, comandos ejecutados, métricas, OS, razones de WARN/SKIP/BLOCKED y defectos pendientes.
4. Resolver errores de TypeScript/lint/tests antes de continuar sobre el mismo subsistema. Mantener calidad del producto por encima de velocidad nominal.
5. Priorizar funcionalidad y seguridad real antes de sumar conectores, gráficos o IA. Si una funcionalidad resulta técnicamente inviable sin un recurso externo, implementar la abstracción y tests reproducibles y marcar lo no validado como bloqueado, con claridad.
6. Cuando finalices, proporcionar un resumen ejecutivo conciso:
   - Rama, PR, SHA y versión candidata (sugerencia: `0.1.0` o `0.2.0` según contenido real, sin fingir release).
   - Matriz de fases 0–6 `DONE / PARTIAL / BLOCKED` y porcentaje derivado de criterios verificables.
   - Funcionalidades demostrables desde VS Code.
   - Seguridad, cobertura real, integración, E2E, rendimiento y capturas.
   - Riesgos P0/P1/P2, fuentes de incertidumbre y pasos de aprobación pendientes.
   - Comandos copy/paste para instalar VSIX, ejecutar tests y revisar el PR.
7. Si el usuario fusiona PR #1 durante el trabajo, actualizar base de rama **sin perder commits**, documentando cualquier conflicto. **Jamás** fusionar la rama de implementación sin su autorización.
8. No prometas trabajo en segundo plano ni afirmes que terminarás más tarde; realizá en tu sesión la mayor implementación verificable que permitan permisos, entorno y tiempo. Si alguna fase no quedó terminada, entregar código y estado preciso, no solo un nuevo prompt.

### Definición final de terminado

**100% TÉCNICO =** todas las capacidades de las fases 0–6 implementadas, evaluadas con sus gates pertinentes, sin P0/P1 propios pendientes; tests, accesibilidad, seguridad, artefacto VSIX, documentación y evidencia coherentes.

**100% DE LANZAMIENTO =** 100% técnico **más** aprobación explícita del propietario, clearance legal y credenciales/servicios necesarios para publicar. Sin esa autorización, el estado correcto es **`READY FOR OWNER APPROVAL`**, nunca `PUBLISHED`.

**Resultado esperado:** *Vestigivo RCA, Incident Intelligence & Root Cause Analysis*, una extensión real de VS Code de alta calidad, basada en evidencia, local-first, segura, mantenible, visualmente profesional, verificable y candidata a publicación **sin publicación automática**.

**INSTRUCCIÓN FINAL:** empezá ahora revisando el HEAD real de `Drako01/vestigivo`, creando o recuperando la rama y el Draft PR de implementación, actualizando el checklist y escribiendo código de la Fase 0/1. **No te detengas después de elaborar el plan.**
