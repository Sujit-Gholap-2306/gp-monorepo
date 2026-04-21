/**
 * Preview portal theming — single source of truth for every colour the
 * Civic Elegant template paints.
 *
 * Why this file exists:
 *   The preview portal is designed to be handed out to many tenants (one per
 *   Gram Panchayat). Each one needs to feel like their village — not a clone.
 *   Rather than scatter hex codes across 10 section components, every colour
 *   comes from here and is injected two ways:
 *
 *     1. CSS custom properties   → for Tailwind arbitrary values, gradients,
 *                                   shadows, CSS-only blocks (preview.css).
 *        Set on <div.civic-root style={themeToCssVars(theme)}> in page.tsx.
 *
 *     2. JS `useTheme()` context → for SVG `fill=` / `stroke=` / `stopColor=`
 *                                   attributes (CSS vars don't reliably
 *                                   resolve inside SVG attributes).
 *        Provided by <PreviewThemeProvider>.
 *
 * Adding a new tenant preset:
 *   Use `makeTheme(base, overrides)` — it deep-merges per-group so you don't
 *   have to restate every `illustration.*` key when you only want a new
 *   accent. See `sahyadriPineTheme` / `koynaSaffronTheme` below.
 *
 *   ⚠ Do NOT write `{ ...civicElegantTheme, accent: {…} }` by hand — shallow
 *   spread leaves stale glow/shadow hexes from the base, so your accent
 *   change looks wrong. `makeTheme` exists specifically to prevent that.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PreviewTheme {
  /** Stable id — used for keys, URLs, persistence. */
  id: string
  /** Human name — shown in the theme switcher. */
  name: string

  /** Page surfaces — bg, the slightly warmer "alt" bg, true paper, and the
   *  on-dark bg used for the achievements / map / ticker blocks. */
  surface: {
    bg: string
    bgSoft: string
    paper: string
    inkDeep: string
  }

  /** Typographic ink — body, de-emphasised, and the softest "caption" ink. */
  ink: {
    base: string
    soft: string
    muted: string
  }

  /** Borders and hairlines at two weights. */
  line: {
    border: string
    borderStrong: string
  }

  /** Primary brand accent — this is the colour a tenant will most want to
   *  customise. In Civic Elegant it's gold; in other presets it might be
   *  saffron, terracotta, Sahyadri pine, etc. */
  accent: {
    /** Core brand accent. Readable on light surfaces. */
    base: string
    /** Lighter tint — used on dark surfaces and for soft glows. */
    soft: string
    /** Deeper, readable text-weight variant. */
    ink: string
    /** Brightest highlight used only in foil/gradient centres. */
    highlight: string
  }

  /** Medal colours for the achievements timeline. */
  medal: {
    gold: string
    silver: string
    bronze: string
  }

  /** Illustration palette — the bespoke bits used inside hand-drawn SVG
   *  artwork (the about-portrait mountain scene and the village map).
   *  Expose them so a tenant can rebrand the artwork, too. */
  illustration: {
    /** About-section portrait — 4-stop diagonal gradient. */
    portraitFrom: string
    portraitMid1: string
    portraitMid2: string
    portraitTo: string
    /** Map — two-stop base gradient (top → bottom). */
    mapLandFrom: string
    mapLandTo: string
    /** Map — farmland parcel fills (alternated across the grid). */
    mapField1: string
    mapField2: string
    mapField3: string
    /** Map — river body + top glint. */
    mapRiverBody: string
    mapRiverGlint: string
    /** Map — label bubble background. */
    mapLabelBg: string
    /** Map — dark pin centre colour (pin is filled with this when inactive). */
    mapPinDark: string
  }

  /** RGBA-only values used for glows and shadow tints. Kept as fully-formed
   *  strings so the gradient author sees intent, not arithmetic. */
  effect: {
    glowAccentLow: string
    glowAccentMid: string
    glowSecondaryLow: string
    glowInkFaint: string
    shadowCard: string
    shadowCardStrong: string
    shadowPortrait: string
  }
}

// ---------------------------------------------------------------------------
// makeTheme — deep-merge helper so presets only restate what they change
// ---------------------------------------------------------------------------

/**
 * Deep-merge overrides onto a base theme. Per-group keys (`surface`, `ink`,
 * `line`, `accent`, `medal`, `illustration`, `effect`) are merged individually
 * so a preset can change only `accent.base` and `accent.soft` without losing
 * the base's `accent.ink` and `accent.highlight`.
 *
 * Do not use shallow spread to build a theme: it leaves the base's glow/shadow
 * alphas behind, which are tinted against the base accent colour — they look
 * wrong under a new accent.
 */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K]
}

export function makeTheme(
  base: PreviewTheme,
  overrides: DeepPartial<Omit<PreviewTheme, 'id' | 'name'>> & {
    id: string
    name: string
  },
): PreviewTheme {
  return {
    id: overrides.id,
    name: overrides.name,
    surface: { ...base.surface, ...overrides.surface },
    ink: { ...base.ink, ...overrides.ink },
    line: { ...base.line, ...overrides.line },
    accent: { ...base.accent, ...overrides.accent },
    medal: { ...base.medal, ...overrides.medal },
    illustration: { ...base.illustration, ...overrides.illustration },
    effect: { ...base.effect, ...overrides.effect },
  }
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

/**
 * Civic Elegant — the default. Cream paper, near-black ink, warm gold.
 * Editorial-magazine × village dignity.
 */
export const civicElegantTheme: PreviewTheme = {
  id: 'civic-elegant',
  name: 'Civic Elegant',
  surface: {
    bg: '#faf7f0',
    bgSoft: '#f3eee2',
    paper: '#ffffff',
    inkDeep: '#141311',
  },
  ink: {
    base: '#141311',
    soft: '#3c3a35',
    muted: '#7a736a',
  },
  line: {
    border: '#e9dfc9',
    borderStrong: '#d6c9a8',
  },
  accent: {
    base: '#b08a3e',
    soft: '#d4b366',
    ink: '#6b5220',
    highlight: '#f5e4b8',
  },
  medal: {
    gold: '#d4b366',
    silver: '#c5cad1',
    bronze: '#b28355',
  },
  illustration: {
    portraitFrom: '#1a1714',
    portraitMid1: '#2a2220',
    portraitMid2: '#3a2d22',
    portraitTo: '#5a4428',
    mapLandFrom: '#2a2018',
    mapLandTo: '#1a1510',
    mapField1: '#2c3222',
    mapField2: '#2f3824',
    mapField3: '#2a3120',
    mapRiverBody: '#4a6a8a',
    mapRiverGlint: '#8fb0c8',
    mapLabelBg: '#1a1510',
    mapPinDark: '#1a1510',
  },
  effect: {
    glowAccentLow: 'rgba(176,138,62,0.10)',
    glowAccentMid: 'rgba(212,179,102,0.22)',
    glowSecondaryLow: 'rgba(14,67,64,0.08)',
    glowInkFaint: 'rgba(20,19,17,0.06)',
    shadowCard: '0 28px 60px -30px rgba(20,19,17,0.22)',
    shadowCardStrong: '0 30px 60px -20px rgba(20,19,17,0.25)',
    shadowPortrait: '0 40px 80px -30px rgba(20,19,17,0.35)',
  },
}

/**
 * Sahyadri Pine — a darker, forest-leaning palette for hill / Western-Ghats
 * villages. Same structure, only the accent family rotates.
 */
export const sahyadriPineTheme: PreviewTheme = makeTheme(civicElegantTheme, {
  id: 'sahyadri-pine',
  name: 'Sahyadri Pine',
  surface: {
    bg: '#f4f2eb',
    bgSoft: '#e9e7dc',
    inkDeep: '#10201c',
  },
  accent: {
    base: '#3a6b4a',
    soft: '#6aa080',
    ink: '#234432',
    highlight: '#b8d8c4',
  },
  medal: {
    gold: '#cfa94a',
    silver: '#b9c0bb',
    bronze: '#9a6a3d',
  },
  line: {
    border: '#d8dccf',
    borderStrong: '#b7c2ac',
  },
  illustration: {
    portraitFrom: '#101e18',
    portraitMid1: '#18261f',
    portraitMid2: '#1f3a2a',
    portraitTo: '#2f5a3e',
    mapLandFrom: '#152520',
    mapLandTo: '#0c1714',
    mapField1: '#1f3226',
    mapField2: '#26402f',
    mapField3: '#1d3125',
    mapRiverBody: '#3f6a7c',
    mapRiverGlint: '#86b3c0',
    mapLabelBg: '#0c1714',
    mapPinDark: '#0c1714',
  },
  effect: {
    glowAccentLow: 'rgba(58,107,74,0.10)',
    glowAccentMid: 'rgba(106,160,128,0.22)',
    glowSecondaryLow: 'rgba(122,75,30,0.08)',
    glowInkFaint: 'rgba(16,32,28,0.06)',
    shadowCard: '0 28px 60px -30px rgba(16,32,28,0.22)',
    shadowCardStrong: '0 30px 60px -20px rgba(16,32,28,0.25)',
    shadowPortrait: '0 40px 80px -30px rgba(16,32,28,0.35)',
  },
})

/**
 * Koyna Saffron — a warmer, Maratha-flag-inspired alternate. Saffron
 * primary. For temple-town tenants.
 */
export const koynaSaffronTheme: PreviewTheme = makeTheme(civicElegantTheme, {
  id: 'koyna-saffron',
  name: 'Koyna Saffron',
  surface: {
    bg: '#fbf6ec',
    bgSoft: '#f5ead6',
    inkDeep: '#1a120a',
  },
  accent: {
    base: '#c9621a',
    soft: '#e89350',
    ink: '#7c3a0d',
    highlight: '#ffd9b0',
  },
  medal: {
    gold: '#e5a644',
    silver: '#c8ccd3',
    bronze: '#a95f2e',
  },
  line: {
    border: '#ead9bc',
    borderStrong: '#d9c096',
  },
  illustration: {
    portraitFrom: '#1d140c',
    portraitMid1: '#2d1f12',
    portraitMid2: '#3f2a18',
    portraitTo: '#6b3e1a',
    mapLandFrom: '#2a1c10',
    mapLandTo: '#1a1108',
    mapField1: '#3a2d1a',
    mapField2: '#42361e',
    mapField3: '#362a18',
    mapRiverBody: '#5a7490',
    mapRiverGlint: '#9ab4c9',
    mapLabelBg: '#1a1108',
    mapPinDark: '#1a1108',
  },
  effect: {
    glowAccentLow: 'rgba(201,98,26,0.12)',
    glowAccentMid: 'rgba(232,147,80,0.22)',
    glowSecondaryLow: 'rgba(42,42,106,0.08)',
    glowInkFaint: 'rgba(26,18,10,0.06)',
    shadowCard: '0 28px 60px -30px rgba(26,18,10,0.22)',
    shadowCardStrong: '0 30px 60px -20px rgba(26,18,10,0.25)',
    shadowPortrait: '0 40px 80px -30px rgba(26,18,10,0.35)',
  },
})

/**
 * Registry of every preset we ship. Add future tenant palettes here.
 */
export const previewThemes: Record<string, PreviewTheme> = {
  [civicElegantTheme.id]: civicElegantTheme,
  [sahyadriPineTheme.id]: sahyadriPineTheme,
  [koynaSaffronTheme.id]: koynaSaffronTheme,
}

export const defaultTheme = civicElegantTheme

/**
 * Look up a theme by id. Unknown id falls back to the default so the portal
 * never renders naked.
 */
export function resolveTheme(id: string | null | undefined): PreviewTheme {
  if (!id) return defaultTheme
  return previewThemes[id] ?? defaultTheme
}

// ---------------------------------------------------------------------------
// CSS variable projection
// ---------------------------------------------------------------------------

/**
 * Turn a theme into the exact set of `--civic-*` custom properties consumed
 * by preview.css and Tailwind arbitrary-value classes across the portal.
 *
 * Pass the returned object to a `style={}` prop on any ancestor of
 * `.civic-root`. Every class like `bg-(--civic-gold)` will resolve against
 * the tenant's palette automatically.
 *
 * Only tokens actually consumed somewhere in the tree are projected — the
 * list below is the contract. If you add a new CSS-var consumer, add the
 * projection here; if you remove the last consumer, remove the projection.
 */
export function themeToCssVars(theme: PreviewTheme): React.CSSProperties {
  return {
    // Surfaces
    '--civic-bg': theme.surface.bg,
    '--civic-bg-soft': theme.surface.bgSoft,
    '--civic-paper': theme.surface.paper,
    '--civic-ink': theme.surface.inkDeep,

    // Ink
    '--civic-ink-soft': theme.ink.soft,
    '--civic-muted': theme.ink.muted,

    // Lines
    '--civic-border': theme.line.border,
    '--civic-border-strong': theme.line.borderStrong,

    // Accent (gold family) — names kept for backwards compatibility with
    // the existing `--civic-gold*` class names sprinkled through the code.
    '--civic-gold': theme.accent.base,
    '--civic-gold-soft': theme.accent.soft,
    '--civic-gold-ink': theme.accent.ink,
    '--civic-gold-highlight': theme.accent.highlight,

    // Illustration palette (about-portrait + map gradient div)
    '--civic-illus-portrait-from': theme.illustration.portraitFrom,
    '--civic-illus-portrait-mid1': theme.illustration.portraitMid1,
    '--civic-illus-portrait-mid2': theme.illustration.portraitMid2,
    '--civic-illus-portrait-to': theme.illustration.portraitTo,

    // Effects — glows and shadows baked as strings so consumers just read.
    '--civic-glow-accent-low': theme.effect.glowAccentLow,
    '--civic-glow-accent-mid': theme.effect.glowAccentMid,
    '--civic-glow-secondary-low': theme.effect.glowSecondaryLow,
    '--civic-glow-ink-faint': theme.effect.glowInkFaint,
    '--civic-shadow-card': theme.effect.shadowCard,
    '--civic-shadow-card-strong': theme.effect.shadowCardStrong,
    '--civic-shadow-portrait': theme.effect.shadowPortrait,
  } as React.CSSProperties
}

// ---------------------------------------------------------------------------
// Small helpers so callers don't build strings by hand
// ---------------------------------------------------------------------------

/**
 * Pick the medal colour for an achievement tier. Centralised so if a tenant
 * rebrands metals (e.g. uses copper instead of bronze), no component needs
 * to know.
 */
export function medalColor(
  theme: PreviewTheme,
  tier: 'gold' | 'silver' | 'bronze',
): string {
  return theme.medal[tier]
}

/**
 * Compose a hex colour with an extra alpha suffix. Accepts 3- or 6-digit
 * hex (with or without `#`). If the input is already `rgba()` or any other
 * format, returns it unchanged — the caller asked for an alpha and the
 * colour can't accept one via string append, so forwarding intact is the
 * safest choice. In dev, a warning is emitted so the author notices.
 */
export function withAlpha(hex: string, alphaHex: string): string {
  const normalized = normalizeHex(hex)
  if (normalized) return `${normalized}${alphaHex}`
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[preview/theme] withAlpha: cannot append alpha to non-hex input "${hex}" — returning as-is.`,
    )
  }
  return hex
}

/**
 * Normalize hex shorthand (#abc → #aabbcc) and strip alpha channel so the
 * output is always exactly #RRGGBB. Returns null if the input isn't a hex
 * colour we recognise.
 */
function normalizeHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`
  if (/^[0-9a-fA-F]{8}$/.test(trimmed)) return `#${trimmed.slice(0, 6)}`
  return null
}
