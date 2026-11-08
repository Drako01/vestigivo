# Vestigivo RCA — Transparent Rounded-Corner Assets

## Non-negotiable visual rule

**Rounded corners must be visibly rounded when the asset is laid over any background.** Never export an opaque square canvas behind a rounded rectangle.

- Vector source: transparent SVG viewport, with a filled `<rect rx="...">` for the *inside* of the rounded badge/card only; do not add a full-viewBox background or flatten the SVG.
- Raster source: **PNG RGBA** with true alpha outside rounded geometry; do **not** export to JPEG or use an opaque rectangular background.
- Activity Bar: dedicated monochrome `currentColor` icon, transparent SVG viewport, no badge backdrop.
- Marketing banners: if a rounded background is intended, its four external corners must also remain transparent; a rectangular screenshot with a rounded box drawn inside does not pass.
- Preserve the previously selected original logo as the visual master. Adding **RCA** must not alter the icon's paths or proportions.

## Measurable acceptance criteria

1. At each image's four extreme corner pixels, alpha **must equal 0** (RGBA (0,0,0,0) or equivalent); not merely a black or white pixel matching a preview surface.
2. An interior pixel of the badge/card must have alpha **255** or intentionally specified equivalent. Anti-aliased pixels along the rounded boundary may have intermediate alpha.
3. Validate at 24px (Activity Bar), 32px, 48px, 128px, 256px. At 16px use the dedicated simplified mark if needed.
4. Composite the exported asset over bright white, near-black, magenta and checkerboard surfaces; check for halos, matte edges and accidentally opaque corners.
5. Validate dark/light variants and their usage in an actual VS Code Extension Host.
6. Keep all original editable SVGs under `media/brand/`; commit final exports only after human visual QA.

### Suggested local RGBA PNG verification

```python
from PIL import Image
im = Image.open("media/brand/vestigivo-icon-256.png").convert("RGBA")
w, h = im.size
assert all(im.getpixel(p)[3] == 0 for p in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)])
assert im.getpixel((w//2,h//2))[3] > 0
print("Rounded-corner alpha: PASS")
```

This document specifies the QA contract, **not a claim that raster exports were already checked**.
