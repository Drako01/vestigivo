# Vestigivo RCA — Checklist Enterprise AAAAA

**Rama:** feat/enterprise-aaaaa-incident-intelligence-20261108. **PR:** #3 Draft. **Base real inicial:** main 6a1ed6fb01a32f302f208330a22f03b9aa1fcd8c. PR #1 y #2 merged. Privado.

[x] significa capacidad o artefacto codificado, **no** fase aceptada sin su DoD y pruebas en HEAD exacto.

## Fase 0 — Marca
- [x] SVG grafo de nodos aprobado preservado sin rediseño.
- [x] Activity Bar monocromático con transparencia.
- [ ] PNG 128/256 versionados con test alpha==0 en esquinas y centro opaco.
- [ ] Inspección visual humana de original, 16–256 px, dark/light/checkerboard.
- [ ] Clearance de marca por propietario.

## Fase 1 — Evidence MVP
- [x] TypeScript estricto, manifest, activación y Control Center central.
- [x] Importación explícita JSON, JSONL, logs estructurados, OTLP JSON; límites de bytes/eventos/profundidad.
- [x] Procedencia, timestamps ns, redacción best-effort.
- [x] Correlación por trace/request ID exactos, timeline determinista, export MD/JSON.
- [x] Git read-only opt-in en workspace trusted.
- [x] Primer corpus de pruebas (7 tests PASS en run 42495295658 SHA 76f974a).
- [ ] Extension Host real, navegación/cancelación, un clic Activity Bar, permisos.
- [ ] UX accesible comprobada con teclado/lector de pantalla, dark/light/alto contraste.

## Fase 2 — Incident Case
- [x] Schema v1, notas, duplicar, archivar, comparación básica.
- [x] Guardar/reabrir/borrar opt-in en VS Code storage.
- [ ] Migraciones aditivas, schema validation estricta, audit trail completo.
- [ ] Zoom/bookmarks, trace tree completo/ciclos, comparación UX.
- [ ] E2E de persistencia entre reinicios.

## Fase 3 — Integraciones
- [x] Prototipo adapter con SecretStorage y HTTP read-only.
- [ ] APIs funcionales Sentry/Grafana, autorización, SSRF, rate limits y mocks.
- [ ] QA live aprobada y receptor OTLP/HTTP seguro si se implementa.

## Fase 4 — RCA
- [x] Evaluación de baseline comparable + intervención controlada, no inferir causa.
- [x] Prueba de estado CONCLUSIVE/INCONCLUSIVE básica PASS en run 42495295658.
- [ ] Workflow plan/verificación manual, estados y corpus adversarial más amplio.

## Fase 5 — Hardening
- [x] CSP nonce, sin scripts remotos en UI, textContent, presupuestos de importación.
- [ ] STRIDE, SSRF, fuzzing, mutation, XSS, Unicode, PII, tests profundos.
- [ ] Cobertura core 85 % líneas / 80 % ramas instrumentada.
- [ ] Bench 1K/10K/100K, P50/P95/RSS.
- [ ] Windows/macOS/Linux reales, remote WSL/SSH/Containers, a11y.

## Fase 6 — Release engineering
- [x] Único Draft PR, pipeline de PR sin redundancia en push main.
- [ ] Lockfile npm ci y licencias/audit completos.
- [ ] VSIX, inventario, SHA256, Extension Host E2E y capturas auténticas.
- [ ] Validación legal y autorización del propietario para publicar/merge.

**Estado por fase: 0 PARTIAL / 1 PARTIAL / 2 PARTIAL / 3 PARTIAL / 4 PARTIAL / 5 PARTIAL / 6 PARTIAL.** No publicar ni fusionar.
