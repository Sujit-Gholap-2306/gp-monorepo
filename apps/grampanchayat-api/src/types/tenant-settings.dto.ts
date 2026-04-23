/** Parsed from multipart form (same field names as grampanchayat admin settings). */
export type TenantSettingsFormBody = {
  name_mr: string
  name_en: string
  established?: string
  village_name_mr?: string
  village_name_en?: string
  taluka?: string
  district?: string
  pincode?: string
  phone?: string
  email?: string
  address_mr?: string
  address_en?: string
  portal_theme?: string
}

function s(raw: Record<string, unknown>, k: string) {
  const v = raw[k]
  if (v === undefined || v === null) return undefined
  return String(v).trim() || undefined
}

/** HTML checkbox: present and typically `"on"` when checked. */
function checkboxOn(raw: Record<string, unknown>, k: string): boolean {
  const v = raw[k]
  if (v === undefined || v === null) return false
  const t = String(v).toLowerCase()
  return t === 'on' || t === 'true' || t === '1' || t === 'yes'
}

export type FeatureFlagsInput = {
  showProgress: boolean
  showMap: boolean
  showAchievements: boolean
}

export function parseTenantSettingsBody(raw: Record<string, unknown>): {
  nameMr: string
  nameEn: string
  established: string | undefined
  village: Record<string, string | undefined>
  contact: Record<string, string | undefined>
  portalTheme: string
  featureFlags: FeatureFlagsInput
  /** Merged in API with existing `gp_tenants.portal_config` */
  portalConfigPatch: Record<string, unknown>
} {
  const nameMr = s(raw, 'name_mr')
  const nameEn = s(raw, 'name_en')
  if (!nameMr || !nameEn) {
    throw new Error('name_mr and name_en are required')
  }

  const portalConfigPatch: Record<string, unknown> = {
    show_stats_strip:        checkboxOn(raw, 'portal_show_stats'),
    hero_tagline_mr:          s(raw, 'portal_hero_tagline_mr'),
    hero_tagline_en:          s(raw, 'portal_hero_tagline_en'),
    hero_background_image_url: s(raw, 'portal_hero_bg_url'),
    meta_title_mr:            s(raw, 'portal_meta_title_mr'),
    meta_title_en:            s(raw, 'portal_meta_title_en'),
    meta_description_mr:      s(raw, 'portal_meta_desc_mr'),
    meta_description_en:     s(raw, 'portal_meta_desc_en'),
    og_image_url:             s(raw, 'portal_og_image_url'),
  }
  for (const key of Object.keys(portalConfigPatch)) {
    if (portalConfigPatch[key] === undefined) delete portalConfigPatch[key]
  }

  return {
    nameMr,
    nameEn,
    established: s(raw, 'established'),
    village: {
      name_mr:  s(raw, 'village_name_mr'),
      name_en:  s(raw, 'village_name_en'),
      taluka:   s(raw, 'taluka'),
      district: s(raw, 'district'),
      pincode:  s(raw, 'pincode'),
    },
    contact: {
      phone:     s(raw, 'phone'),
      email:     s(raw, 'email'),
      address_mr: s(raw, 'address_mr'),
      address_en: s(raw, 'address_en'),
    },
    portalTheme: s(raw, 'portal_theme') ?? 'civic-elegant',
    featureFlags: {
      showProgress:   checkboxOn(raw, 'feature_showProgress'),
      showMap:        checkboxOn(raw, 'feature_showMap'),
      showAchievements: checkboxOn(raw, 'feature_showAchievements'),
    },
    portalConfigPatch,
  }
}
