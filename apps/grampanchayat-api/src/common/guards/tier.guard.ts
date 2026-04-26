import type { RequestHandler } from 'express'
import { ApiError } from '../exceptions/http.exception.ts'

export const TIERS = ['free', 'pro', 'enterprise'] as const
export type Tier = (typeof TIERS)[number]

export const FEATURES = ['content', 'certificates', 'namune', 'audit', 'tax', 'multi_gp'] as const
export type Feature = (typeof FEATURES)[number]

const TIER_FEATURES: Record<Tier, readonly Feature[]> = {
  free: ['content'],
  pro: ['content', 'certificates', 'namune', 'audit', 'tax'],
  enterprise: ['content', 'certificates', 'namune', 'audit', 'tax', 'multi_gp'],
}

function canAccess(tier: Tier, feature: Feature): boolean {
  return TIER_FEATURES[tier].includes(feature)
}

/**
 * Server-side tier gate. Mount AFTER `supabaseTenantAdminGuard` so `req.gpTenant`
 * is populated. CLAUDE.md: BE is the security boundary for tier gating; FE
 * checks are UX only.
 */
export function requireFeature(feature: Feature): RequestHandler {
  return (req, _res, next) => {
    const tenant = req.gpTenant
    if (!tenant) return next(new ApiError(500, 'Tenant context missing'))
    if (!canAccess(tenant.tier as Tier, feature)) {
      return next(new ApiError(403, `या योजनेत ${feature} सुविधा उपलब्ध नाही`))
    }
    next()
  }
}
