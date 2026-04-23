import type { Json } from './supabase/types'

/** Theme ids aligned with `lib/preview/theme.ts` `resolveTheme` and admin settings. */
export const PORTAL_THEME_IDS = ['civic-elegant', 'sahyadri-pine', 'koyna-saffron'] as const
export type PortalThemeId = (typeof PORTAL_THEME_IDS)[number]

export function isPortalThemeId(value: string): value is PortalThemeId {
  return (PORTAL_THEME_IDS as readonly string[]).includes(value)
}

/** Default JSONB in DB — see `apps/grampanchayat-api/src/db/schema/tenants.ts`. */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  showProgress: true,
  showMap: true,
  showAchievements: true,
}

export type FeatureFlags = {
  showProgress: boolean
  showMap: boolean
  showAchievements: boolean
}

/**
 * `gp_tenants.portal_config` (JSONB) — public portal copy, layout, and SEO.
 * All keys optional; missing keys use UI fallbacks in components.
 */
export type PortalConfig = {
  /** Hero subheading (replaces default tagline) */
  hero_tagline_mr?: string
  hero_tagline_en?: string
  /** If false, hide the home stats row. Default: show when true/omitted. */
  show_stats_strip?: boolean
  /** Optional full-bleed hero background (URL). */
  hero_background_image_url?: string
  meta_title_mr?: string
  meta_title_en?: string
  meta_description_mr?: string
  meta_description_en?: string
  /** Open Graph / social image (prefer absolute https URL). */
  og_image_url?: string
  /** If true, include About section in nav/home where applicable. */
  show_about?: boolean
  [key: string]: unknown
}

export function normalizeFeatureFlags(value: Json | null | undefined): FeatureFlags {
  if (!value || typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { ...DEFAULT_FEATURE_FLAGS }
  }
  const o = value as Record<string, unknown>
  return {
    showProgress: o.showProgress === false ? false : true,
    showMap: o.showMap === false ? false : true,
    showAchievements: o.showAchievements === false ? false : true,
  }
}

export function normalizePortalConfig(value: Json | null | undefined): PortalConfig {
  if (!value || typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {}
  }
  return { ...(value as Record<string, unknown>) } as PortalConfig
}

export function normalizePortalTheme(value: string | null | undefined): PortalThemeId {
  if (value && isPortalThemeId(value)) return value
  return 'civic-elegant'
}

/** Default taglines when not set in `portal_config`. */
export const DEFAULT_HERO_TAGLINES = {
  mr: 'आपल्या गावाची अधिकृत वेबसाइट — घोषणा, कार्यक्रम, पदाधिकारी व माहिती एकाच ठिकाणी.',
  en: "Your village's official portal — announcements, events, post holders, and information, all in one place.",
} as const

/** Single hero line for the active locale. */
export function getHeroTaglineForLocale(
  portal: PortalConfig,
  locale: 'mr' | 'en',
): string {
  if (locale === 'mr') {
    return portal.hero_tagline_mr?.trim() || DEFAULT_HERO_TAGLINES.mr
  }
  return portal.hero_tagline_en?.trim() || DEFAULT_HERO_TAGLINES.en
}

export function getShowStatsStrip(portal: PortalConfig): boolean {
  return portal.show_stats_strip !== false
}
