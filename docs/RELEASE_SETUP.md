# Vestigivo RCA — Configuración de publicación 0.1.1

**Estado:** preparación de CI/CD sobre [Draft PR #3](https://github.com/Drako01/vestigivo/pull/3). El propietario decidió cambiar la visibilidad del repositorio a **público**; todavía debe verificarse el cambio efectivo. No ejecutar merge ni publicar antes de completar las verificaciones.

## Cadena de versión

1. **0.1.0**: primera versión publicada manualmente por el propietario. La captura del 8-11-2026 muestra versión activa en Open VSX; para Marketplace, verificar su ficha por separado.
2. **0.1.1**: código y manifiesto preparados en PR #3, jamás publicados mientras el PR esté en Draft.
3. Un merge a `main` con **incremento de versión** activa únicamente `.github/workflows/publish.yml`. `release-guard.cjs` exige: PR squash asociado, equivalencia exacta del árbol de Git, última verificación verde del SHA del PR y los tres jobs reales, incluido el smoke de macOS (no basta un job verde con `continue-on-error`).
4. En el merge **no se vuelven a correr los tests del PR**. Se compila el VSIX que se enviará a ambos registros y se comprueba su SHA-256. Si no cambia la versión, la publicación se omite.

## Visual Studio Marketplace — OIDC

- Configurar en el publisher `armotusitio` una política Trusted Publishing:
  - Provider `GitHub Actions`
  - Owner `Drako01`, repository `vestigivo`
  - Workflow `publish.yml`
  - Environment `marketplace`
- En GitHub, crear Environment `marketplace`, limitar deployments a `main` y exigir aprobación del propietario cuando corresponda.
- El job `marketplace` tiene `id-token: write` y ejecuta `vsce publish --oidc --packagePath ...`. **Nunca** se requiere `VSCE_PAT`.
- Para repositorios privados, Marketplace exige realizar el primer canje de token dentro de 48 horas de crear la política; luego queda permanentemente activa. Si caduca, reactivar/recrear la política cuando el release esté realmente listo. La captura del propietario indica vencimiento **10-11-2026 14:05 hora local**.
- En PR y en `main` nunca instalar un workflow que publique solo por cerrar un PR sin gate de versión y evidencia.

## Open VSX — Trusted Publishing OIDC (repositorio público)

El propietario decidió hacer público `Drako01/vestigivo`. **El cambio de visibilidad debe confirmarse en GitHub antes de registrar la política; a la fecha de este corte, la última consulta todavía devolvió `private`.**

La captura del propietario confirma que `0.1.0` ya aparece como versión activa en Open VSX. Cuando GitHub responda **public**, registrar en Open VSX → Trusted Publishers:

| Campo | Valor |
| --- | --- |
| Namespace | `armotusitio` |
| Extension | `vestigivo` |
| Provider | GitHub Actions |
| Owner | `Drako01` |
| Repository | `vestigivo` |
| Workflow | `publish.yml` |
| Environment | `open-vsx` |

GitHub → Settings → Environments → `open-vsx`: permitir deployments solo desde `main` y solicitar aprobación del propietario. Esta protección es importante porque el registro de Open VSX por sí solo no restringe ramas.

El job `open-vsx` usa `id-token: write`, `ovsx publish --trusted-publishing` y verifica el SHA-256 del mismo VSIX enviado a Marketplace. **No utiliza `OVSX_PAT`**; el script lo elimina del entorno. Una vez confirmado OIDC, eliminar el secret antiguo en GitHub para evitar credenciales persistentes.

**No habilitar la publicación antes de confirmar el registro OIDC y los checks de release.** Si el registro sigue mostrando "Could not resolve GitHub repository", verificar que el repositorio realmente sea público y refrescar/reintentar la pantalla. No reemplazar OIDC por un PAT sin una decisión explícita.

## Diagnóstico y fallos parciales

- **Marketplace policy Inactive / Never:** aún no intercambió exitosamente el primer OIDC. No es un error de nombres.
- **Open VSX cannot resolve repository:** confirmar que GitHub ya muestre el repositorio como público y volver a registrar la política; no se puede acreditar OIDC mientras persista el error.
- **macOS host ENOENT / exit -2:** gate final de autorización bloquea `0.1.1`; el job de compatibilidad anterior tenía `continue-on-error`. No saltar este gate para acelerar publicación.
- **Un marketplace falla después de que el otro publica:** usar *Re-run failed jobs* sobre el mismo run/artefacto, sin crear una nueva versión y sin reconstruir otro VSIX. Un release parcial debe quedar claramente marcado.
- `0.1.1` no se ha enviado a ningún registro desde este trabajo.

## Comprobación previa al merge

```bash
git fetch origin
git switch feat/enterprise-aaaaa-incident-intelligence-20261108
git merge --ff-only origin/feat/enterprise-aaaaa-incident-intelligence-20261108
npm ci --ignore-scripts --no-fund
npm run check
npm run package:vsix
```

**Responsabilidad final:** el propietario decide el merge y la publicación; los gates evitan publicar sin revisión.
