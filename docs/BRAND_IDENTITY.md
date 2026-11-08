# Vestigivo RCA — Brand Identity v1 (working draft)

## Positioning
**Public name:** Vestigivo RCA
**Technical identifier:** vestigivo (repository, package and command namespace)
**Acronym:** RCA = Root Cause Analysis; a method of investigation, never a guarantee of automatic causal proof
**Category:** Developer Tools / Incident Intelligence
**Tagline:** *Every incident leaves evidence.*
**Functional promise:** Investigate operational incidents and regressions by connecting observable events, trace context and source changes, without overstating causal certainty.
**Publisher:** armotusitio · Alejandro Di Stefano · ArmoTuSitio.com.ar

## Naming decision

Keep the GitHub repository `Drako01/vestigivo` and technical identifiers `vestigivo`; market the extension as **Vestigivo RCA**. The descriptor is integral to the public wordmark and Marketplace displayName. Avoid adding RCA to namespace or package IDs. Retain `Every incident leaves evidence.` as the primary slogan. Never interpret the RCA acronym as a product guarantee.

## Etymology and product personality
Inspired by Latin **vestigium** (footprint/trace). The ending **-ivo** fits the product family (Indizivo, Orquestivo, Saturivo, Noditrivo). Premium, technical, precise, quiet, evidence-first, trustworthy. This is an original visual direction, not a claim of trademark availability or exclusive usage.

## Approved source visual and transparency rule

The creator explicitly preferred the original logo shown in the project conversation. **Preserve that preferred mark:** its composition, proportions, rounded background, and original visual identity are the source of truth. "RCA" should be added to the wordmark typographically, not by redesigning the symbol.

**Mandatory export requirement:** whenever the logo background has rounded corners, all pixels outside the rounded silhouette **MUST be fully transparent (alpha=0)**. The dark or light fill only exists *inside* the rounded rectangle. Never export a full rectangular JPG, opaque PNG matte, square background, screenshot crop, or fake rounded edge. Export PNG in **RGBA** with genuine transparency. For the Activity Bar keep a monochrome SVG without any colored or opaque background.

The existing SVG symbol and lockups use rounded `rect` geometry with no full-canvas background, so their **vector corners are transparent by design**. Final PNG exports and exact visual equivalence with the user's preferred original image remain to be verified; see [Transparency QA](BRAND_TRANSPARENCY.md).

## Symbol — the convergence lens
The logo joins three distinct trails into a focal ring. Two descending paths form an abstract V (Vestigivo); small nodes are observable signals and the central lens represents investigation. Teal = observation, violet = correlation, amber = hypothesis. **Never use icon color as a substitute for textual status.**
Assets:
- media/brand/vestigivo-symbol.svg — standalone square primary icon, dark master.
- media/brand/vestigivo-activity-bar.svg — single-color 24x24 Activity Bar icon. VS Code decides the actual tint.
- media/brand/vestigivo-lockup-dark.svg — dark marketing lockup.
- media/brand/vestigivo-lockup-light.svg — light marketing lockup.
- media/brand/moodboard.svg — editable SVG moodboard.
- media/brand/tokens.css — design reference tokens.

## Palette
| Role | Hex | Meaning |
|---|---|---|
| Midnight Graphite | #10151D | Main dark background |
| Forensic Surface | #151E29 | Cards/panels |
| Slate Border | #2B3C4F | Dividers |
| Pearl White | #E9F1FA | Primary text |
| Cool Silver | #AFC0D2 | Secondary text |
| Evidence Teal | #4DD6C8 | Observed, grounded |
| Correlation Violet | #8574E8 | Temporal/contextual link |
| Hypothesis Amber | #E6A75B | Unproven hypothesis |
| Incident Coral | #F67880 | Error/incident state |

**Accessible UI rule:** Webviews use \`--vscode-*\` theme variables for surfaces, text, focus borders and high contrast. Brand colors are accents only; test WCAG 2.2 AA contrast on actual backgrounds and high-contrast themes. Never force a dark background in the live webview. Check reduced motion.

## Typography
- Display/brand: Inter 700–800; fallback Segoe UI, Arial, sans-serif.
- Interface: VS Code native font variables; user theme first.
- Timestamps, trace/request IDs: JetBrains Mono or VS Code editor monospace, fallback monospace.
- No font binaries committed or distributed.

## Usage rules
- Clear space >= 1/4 of the icon's width around primary symbol.
- Primary symbol minimum 32×32 CSS pixels; 24×24 uses the dedicated simplified Activity Bar SVG.
- Do not rotate the symbol, use heavy shadows, blur, outlines or glow for UI controls.
- Do not modify paths independently across variants or swap status color meaning.
- At product launch generate optimized Marketplace PNG at 128x128, 256x256 and any required social variants, validate visually with authentic Extension Host screenshots. SVG icon alone does not satisfy the Marketplace PNG requirement.
- The wordmark SVG uses system font fallback; for final production marketing exports outline the text or rasterize it after typography approval.
- Asset licensing: artwork created for this repository. Do not embed third-party imagery or licensed fonts.

## Brand voice
Factual, investigative, neutral, technically precise. Preferred: **Observed**, **Correlated**, **Hypothesis**, **Inconclusive**, **Verified by a reproducible check**.
Forbidden: "AI proved root cause", "production safe", "100% certain" without a causal reproduction.
ES: "Cada incidente deja evidencia". EN: "Every incident leaves evidence."

## Next visual QA
- [ ] Review symbol at 16/24/32/48/128/256px.
- [ ] Confirm monochrome Activity Bar legibility on dark, light and high-contrast VS Code themes.
- [ ] Validate lockups with final typography and real PNG exports, including transparent corner-alpha pixel checks.
- [ ] Capture actual VS Code Control Center screenshots after UX is implemented.
- [ ] Verify naming against trademark registers before public marketing.
