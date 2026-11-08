# Vestigivo RCA — Guía de uso

**Incident Intelligence & Root Cause Analysis**, desarrollado por **Alejandro Daniel Di Stefano — [ArmoTuSitio](https://armotusitio.com.ar)**.

Vestigivo RCA permite investigar incidentes dentro de Visual Studio Code, correlacionando evidencias seleccionadas manualmente y preservando la trazabilidad de cada observación. **Una correlación nunca constituye por sí sola una causa raíz confirmada**.

## Funcionalidades de la candidata 0.1.1

| Módulo | Función |
| --- | --- |
| Importación local | Archivos JSON, JSONL, NDJSON, logs JSON y OpenTelemetry JSON; procedencia SHA-256 y presupuestos de recursos |
| Cronología | Búsqueda, severidad, servicio, IDs exactos de trace/request, fechas UTC y páginas de 100 registros |
| Trazas | Relaciones padre/hijo; advertencias por ausencia, ciclos y ambigüedad |
| Correlaciones | Agrupación de identificadores exactos, sin inferir causalidad |
| Investigaciones | Crear, renombrar, duplicar, archivar, anotar, guardar y comparar casos |
| Hipótesis | Formular explicaciones falsables y registrar planes manuales de verificación |
| Reportes | Exportar JSON y Markdown redactados con contexto, limitaciones y procedencia |
| Contexto Git | Lectura explícita y acotada del historial, únicamente en espacios confiables |
| Sentry / Grafana | Integraciones opcionales de lectura, con autorización y credenciales en SecretStorage |

## Primeros pasos

1. Hacé clic en **Vestigivo RCA** en la Activity Bar. El **Control Center** se abre en una pestaña central.
2. Seleccioná **Importar evidencia** y elegí archivos JSON/JSONL locales.
3. Revisá la cronología y las correlaciones antes de formular hipótesis.
4. En **Investigación**, agregá anotaciones y, si corresponde, un plan de verificación. El plan **no ejecuta** pruebas.
5. Elegí **Guardar localmente** o exportar solo cuando desees persistir la información.

La interfaz tiene navegación en español e inglés. Los mensajes de dominio técnico y algunas descripciones aún pueden aparecer en inglés.

## Privacidad y seguridad

- Sin escaneo, envío de logs, telemetría propia, IA o remediación automática.
- Git y proveedores remotos requieren autorización explícita.
- La redacción de secretos/PII es **best-effort**: revisá los reportes antes de compartirlos.
- Los casos persistidos no tienen cifrado propio; dependen de los controles de VS Code y del sistema operativo.

## Limitaciones y calidad

No soporta todavía OTLP/gRPC Protobuf, ejecución automática de verificaciones ni streaming incremental de fuentes grandes. La comparación de casos no prueba que una ausencia implique resolución. Algunas pruebas de accesibilidad visual, macOS Extension Host y compatibilidad remota siguen pendientes.

El estado exacto de implementación y las evidencias se registran en [Enterprise AAAAA Checklist](ENTERPRISE_AAAAA_CHECKLIST.md), [Release Readiness](RELEASE_READINESS.md) y [Acceptance Evidence](ACCEPTANCE_EVIDENCE.md).

## Desarrollo local

```bash
npm ci --ignore-scripts --no-fund
npm run check
npm run package:vsix
```

**Publicación:** la 0.1.0 se distribuye manualmente. La 0.1.1 se publicará desde GitHub Actions tras el merge autorizado a `main`, nunca desde el Draft PR. Ver [instrucciones de Trusted Publishing](RELEASE_SETUP.md).

---

**Designed and developed by Alejandro Daniel Di Stefano** — © 2026 [ArmoTuSitio](https://armotusitio.com.ar). Licencia MIT.
