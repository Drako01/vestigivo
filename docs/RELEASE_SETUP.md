# Vestigivo RCA — Publicación automatizada desde GitHub Actions

**Iteración:** `v0.1.2` · [Repositorio](https://github.com/Drako01/vestigivo) · [Releases](https://github.com/Drako01/vestigivo/releases)

## Estado verificado

- `0.1.0`: publicación inicial manual.
- `0.1.1`: publicada correctamente por Trusted Publishing (OIDC) en **Visual Studio Marketplace y Open VSX**, tras el merge del [PR #3](https://github.com/Drako01/vestigivo/pull/3). [Run real #42508738437](https://github.com/Drako01/vestigivo/actions/runs/42508738437): `authorize`, `package`, `marketplace`, `open-vsx` todos **SUCCESS**.
- `0.1.1` no tuvo GitHub Release: [la lista de Releases](https://github.com/Drako01/vestigivo/releases) estaba vacía antes de esta iteración. **No reconstruir ni republicar 0.1.1**.
- `0.1.2`: versión incrementada en `package.json`, `package-lock.json` y `CHANGELOG.md`. Pendiente de PR, aprobación y merge; agregar GitHub Release es el objetivo de esta iteración.

## Política para v0.1.2 y posteriores

La validación sucede únicamente en el **PR** mediante `.github/workflows/ci.yml`. La protección de `main` exige `Verify (ubuntu-latest)`, `Verify (windows-latest)`, `Verify (macos-latest)`, aprobación y **Squash and merge**.

Después de un merge autorizado, `.github/workflows/publish.yml` ejecuta:

1. **authorize**: compara el incremento SemVer; comprueba que el árbol fusionado coincida exactamente con el PR aprobado y que los tres jobs de CI del SHA de origen pasaran. Si no cambió la versión, omite la publicación.
2. **package**: compila una vez y genera `vestigivo-<version>.vsix`, `SHA256SUMS`. Ambos se almacenan en un único artifact de Actions.
3. **marketplace**: descarga ese artifact, valida `sha256sum --check SHA256SUMS` y publica con `vsce --oidc`.
4. **open-vsx**: descarga el mismo artifact, valida su SHA y publica con `ovsx --trusted-publishing`.
5. **github-release**: **solo si los dos registros anteriores finalizaron con éxito**. Descarga el mismo artifact, verifica integridad, confirma que `main` aún apunta al SHA fusionado, crea o valida la etiqueta protegida `v<version>`, publica un GitHub Release con notas automáticas y adjunta el VSIX más `SHA256SUMS`. Descarga lo publicado y verifica que sus bytes son idénticos.

No se ejecuta nuevamente el harness completo al fusionar y no se reconstruye el VSIX para GitHub Releases.

## Entornos y permisos

| Job | Environment | Permisos adicionales |
| --- | --- | --- |
| `marketplace` | `marketplace` | `id-token: write` |
| `open-vsx` | `open-vsx` | `id-token: write` |
| `github-release` | `github-release` | `contents: write` |

Los dos Trusted Publishers OIDC ya están configurados. Para GitHub Releases, crear o revisar el environment **`github-release`** en Settings → Environments, limitarlo a `main` y, si se desea aprobación manual adicional, definir un reviewer. **No requiere PAT**; usa `GITHUB_TOKEN` del propio workflow.

El ruleset `Protect release tags` protege las etiquetas `v*` frente a actualización y eliminación. El proceso crea una etiqueta ligera que apunta al commit exacto de `main`. Si la etiqueta existe para otro SHA, **falla sin sobrescribir**.

## Idempotencia y fallos parciales

- **Solo docs / sin incremento de versión:** `authorize` no publica nada.
- **Marketplace o Open VSX fallan:** no se crea GitHub Release. Corregir el job fallido y ejecutar *Re-run failed jobs* en el **mismo run**, manteniendo el artifact original.
- **La etiqueta ya existe en otro commit:** el pipeline falla; no mueve el tag.
- **GitHub Release existente:** verifica los archivos descargados contra el checksum original; **no sobrescribe assets ni reemite un release inconsistente**.
- **`main` avanzó antes del Release:** aborta la publicación de una versión obsoleta, protegiendo la relación etiqueta → commit.
- **Environment `github-release` requiere aprobación:** el job espera esa aprobación; esto no implica que Marketplace/Open VSX deban volver a publicar.

## Resultado esperado tras el merge de 0.1.2

- Versión `0.1.2` en Marketplace y Open VSX.
- Etiqueta protegida `v0.1.2` apuntando al commit fusionado.
- [GitHub Release v0.1.2](https://github.com/Drako01/vestigivo/releases/tag/v0.1.2) con:
  - `vestigivo-0.1.2.vsix`
  - `SHA256SUMS`
  - Notas generadas por GitHub.
- Checksum coincidente para los tres destinos.

**No publicar ni fusionar esta versión automáticamente desde un PR; el propietario conserva la decisión de merge.** El run de GitHub Actions es la evidencia definitiva de publicación, no esta documentación.
