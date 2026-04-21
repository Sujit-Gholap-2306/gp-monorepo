/**
 * Tier-based feature gating.
 *
 * Single source of truth for what each tier unlocks. Gate in THREE places:
 *   1. Middleware — redirect unauthorized tier routes
 *   2. UI — render locked icon + upgrade CTA for out-of-tier nav items
 *   3. BE (grampanchayat-api) — server-side check on every mutation (security boundary)
 */

export const TIERS = ['free', 'pro', 'enterprise'] as const
export type Tier = (typeof TIERS)[number]

export const FEATURES = [
  'content',       // announcements, events, gallery, post-holders, settings
  'certificates',  // उतारे — birth/death, 7/12, property
  'namune',        // 33 registers accounting
  'audit',         // audit trail + reports
  'tax',           // N08 → N10 tax collection chain
  'multi_gp',      // block/taluka level aggregation
] as const
export type Feature = (typeof FEATURES)[number]

export const TIER_FEATURES: Record<Tier, readonly Feature[]> = {
  free:       ['content'],
  pro:        ['content', 'certificates', 'namune', 'audit', 'tax'],
  enterprise: ['content', 'certificates', 'namune', 'audit', 'tax', 'multi_gp'],
}

export function canAccess(tier: Tier, feature: Feature): boolean {
  return TIER_FEATURES[tier].includes(feature)
}

/**
 * Map URL path segments to features. Used by middleware to decide access.
 * Routes not in this map are considered 'content' (always allowed in all tiers).
 */
export const ROUTE_FEATURE_MAP: Record<string, Feature> = {
  certificates: 'certificates',
  namune:       'namune',
  utaras:       'namune',
  cashbook:     'namune',
  namuna8:      'namune',
  collect:      'tax',
  demand:       'tax',
  classified:   'namune',
  assessment:   'namune',
  properties:   'namune',
  audit:        'audit',
  reports:      'audit',
}

export function featureForPath(pathname: string): Feature {
  const segments = pathname.split('/').filter(Boolean)
  for (const seg of segments) {
    const f = ROUTE_FEATURE_MAP[seg]
    if (f) return f
  }
  return 'content'
}
