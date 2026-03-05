# TDB Explorer — Design System

## Direction: "The Schematic"

A system cartography tool for tracing TDB request flows through a Cerner EHR.
The interface should feel like a well-organized technical schematic — precise, dense
where density serves comprehension, with amber warmth against cold infrastructure.

**Who:** Clinical informaticist or healthcare IT developer tracing data flows.
**Task:** Find request IDs, trace caller-handler relationships, understand record structures.
**Feel:** Architectural schematic. Dense, navigable, precise. Terminal warmth on cold slate.

## Signature Element

The **caller → request → handler flow diagram** on request detail. This directional
relationship is the product's reason to exist and appears nowhere else.

## Tokens

### Surfaces (cool dark slate, whisper-quiet elevation)
- `--canvas`: #0c0e12 (base)
- `--surface-1`: #12151b (elevated)
- `--surface-2`: #181c24 (higher)
- `--surface-3`: #1e222c (highest)

### Foreground (four-level text hierarchy)
- `--ink-primary`: #d0d4dc (default text)
- `--ink-secondary`: #8e95a4 (supporting)
- `--ink-tertiary`: #5c6370 (metadata/labels)
- `--ink-muted`: #3c4250 (disabled/placeholder)

### Borders (rgba for blending, not solid hex)
- `--border`: rgba(140, 150, 170, 0.08) (standard)
- `--border-soft`: rgba(140, 150, 170, 0.05) (separation)
- `--border-emphasis`: rgba(140, 150, 170, 0.14) (emphasis)
- `--border-focus`: rgba(212, 165, 116, 0.5) (focus rings)

### Accent: Amber
- `--accent`: #d4a574 (primary)
- `--accent-dim`: #a07850 (borders, connectors)
- `--accent-muted`: rgba(212, 165, 116, 0.12) (backgrounds)
- `--accent-subtle`: rgba(212, 165, 116, 0.06) (hover tints)

### Semantic
- `--signal-success`: #6a9e78
- `--signal-warning`: #b89c62
- `--signal-error`: #a06a6a
- `--signal-info`: #6a88a0

### Category Colors (desaturated, systematic indicators)
Each category has a `-bg` (tinted surface) and `-fg` (muted text) variant.
Low chroma — enough to differentiate, not decorate.

## Depth Strategy

**Borders only.** No shadows. Clean, technical. Fits the schematic metaphor.
- Standard separation: `--border`
- Soft separation (table rows): `--border-soft`
- Section emphasis: `--border-emphasis`
- Interactive focus: `--border-focus` + focus ring

## Typography

- **Body:** Inter (400, 500, 600, 700)
- **Mono:** JetBrains Mono — for reqids, program names, record fields, counts
- **Headings:** 1.125rem, weight 600, tight tracking (-0.01em)
- **Section labels:** 0.75rem, weight 600, uppercase, 0.05em tracking
- **Body text:** 0.8125rem
- **Small/meta:** 0.6875rem
- **Tiny (tags, chips):** 0.625rem

## Spacing

4px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48.
CSS variables: `--sp-1` through `--sp-12`.

## Radius

- `--radius-sm`: 3px (tags, badges)
- `--radius-md`: 5px (inputs, cards, buttons)
- `--radius-lg`: 8px (major containers, chips)

## Controls

- Input background: `--control-bg` (#0e1016) — slightly darker than canvas (inset)
- Input border: `--control-border` — subtle
- Focus: amber border + 2px focus ring

## Component Patterns

### Data Table
- Header: uppercase, 0.6875rem, tertiary color, emphasis border-bottom
- Rows: soft border-bottom, 0.8125rem, secondary color
- Hover: surface-1 background
- Reqids in accent color, mono font

### Category Badge
- Inline, minimal padding (1px horizontal, sp-2 sides)
- Background: desaturated tinted surface from category tokens
- Text: desaturated category foreground
- Size: 0.6875rem

### Tags
- Mono font, 0.625rem
- Surface-1 background + soft border
- Tertiary text

### Filter Input
- Filter icon (funnel) positioned left
- Same control styling as search

### Flow Diagram (Signature)
- Full-width container on surface-1
- Three columns: callers | request (center) | handler
- Caller/handler nodes: surface-2 with standard border
- Request node: accent-subtle bg with accent-dim border, large reqid
- Connected by amber lines + arrow SVGs
- Column labels: 0.625rem uppercase, muted

### Pagination
- Separated by soft border-top
- Button style: transparent bg, standard border, tertiary text
- Page info in mono
