/**
 * Tenant resolution by subdomain for Next.js routing and layouts.
 * This stays on Supabase (not grampanchayat-api) — routing and middleware are frontend concerns.
 * Domain content reads/writes use the API under lib/api/.
 */
import { cache } from 'react'
import {
  normalizeFeatureFlags,
  normalizePortalConfig,
  normalizePortalTheme,
} from './portal-config'
import { createSupabaseServerClient } from './supabase/server'
import type { Tables } from './supabase/types'
import type { ContactInfo, GpTenant, VillageInfo } from './types'
import type { Tier } from './tiers'
import { TIERS } from './tiers'

function normalizeTier(value: string | null | undefined): Tier {
  if (value && (TIERS as readonly string[]).includes(value)) {
    return value as Tier
  }
  return 'free'
}

function mapTenantRow(data: Tables<'gp_tenants'>): GpTenant {
  return {
    ...data,
    village: (data.village as VillageInfo | null) ?? null,
    contact: (data.contact as ContactInfo | null) ?? null,
    portal_config: normalizePortalConfig(data.portal_config),
    feature_flags: normalizeFeatureFlags(data.feature_flags),
    portal_theme: normalizePortalTheme(data.portal_theme),
    tier: normalizeTier(data.tier),
  }
}

export const getTenant = cache(async (subdomain: string): Promise<GpTenant | null> => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gp_tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .single()

  if (error || !data) return null

  return mapTenantRow(data)
})
