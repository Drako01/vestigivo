# Vestigivo RCA — Configuración de publicación 0.1.1

**Estado:** preparación de CI/CD sobre [Draft PR #3](https://github.com/Drako01/vestigivo/pull/3). No ejecutar merge, publicar ni modificar la visibilidad antes de completar las verificaciones. El repositorio `Drako01/vestigivo` permanece **privado**.

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

## Open VSX — Repo privado / bloqueo conocido

La captura del propietario muestra `0.1.0` publicada en Open VSX y el error **"Could not resolve GitHub repository Drako01/vestigivo"** al registrar Trusted Publishing. Es coherente con la API pública de GitHub para repositorios privados.

La documentación de Open VSX prevé **registro pendiente por código** desde servidor **1.4.0** y CLI compatible con `--registrationCode`, pero la pantalla actual todavía devuelve error, por lo que **no declarar OIDC activo**.

**Alternativa inmediata, sin hacer público el código:**

1. Crear el Environment `open-vsx` en GitHub, con restricciones de rama `main` y aprobación.
2. Generar un token en Open VSX (Settings → Access Tokens). Guardarlo como **Environment secret `OVSX_PAT`** en `Drako01/vestigivo` → Settings → Environments → `open-vsx` → Environment secrets. **Nunca** pegarlo en commits, screenshots, variables públicas ni logs.
3. El job `open-vsx` descarga exactamente el mismo VSIX, verifica `SHA256SUMS` y llama a `ovsx publish` con token tomado **solo del entorno protegido**. Los jobs externos no tienen ese secret.
4. Cuando el Open VSX en uso permita la nueva modalidad para privados: registrar con `publish.yml` y environment `open-vsx`, guardar el código de un solo uso en Environment secret, ejecutar el primer publish OIDC, eliminar `OVSX_PAT` y recién después actualizar el workflow para `ovsx publish --trusted-publishing`.

## Diagnóstico y fallos parciales

- **Marketplace policy Inactive / Never:** aún no intercambió exitosamente el primer OIDC. No es un error de nombres.
- **Open VSX cannot resolve repository:** visibilidad privada del repositorio + registro sin modo pendiente disponible en la instancia.
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
