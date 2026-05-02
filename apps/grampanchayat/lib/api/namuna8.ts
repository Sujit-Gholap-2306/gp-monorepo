import { apiFetch, buildApiUrl } from './client'
import { tenantApiPaths } from './endpoints'

export type Namuna8PropertyType =
  | 'jhopdi_mati'
  | 'dagad_vit_mati'
  | 'dagad_vit_pucca'
  | 'navi_rcc'
  | 'bakhal'

export type Namuna8RateMasterStatus = {
  isComplete: boolean
  missingPropertyTypes: string[]
  incompletePropertyTypes: string[]
}

export type Namuna8ListItem = {
  id: string
  propertyNo: string
  propertyType: Namuna8PropertyType | string
  wardNumber: string
  owner: {
    citizenId: string
    citizenNo: number
    nameMr: string
    nameEn: string | null
  }
  occupantName: string
  surveyNumber: string | null
  plotOrGat: string | null
  resolutionRef: string | null
  assessmentDate: string | null
  ageBracket: string | null
  dimensions: {
    lengthFt: number | null
    widthFt: number | null
  }
  readyReckonerPerSqM: {
    land: number
    imarat: number
    bandhkam: number | null
  }
  assessment: {
    depreciationFactor: number
    usageWeightage: number
    taxRatePaise: number
  }
  area: {
    sqFt: number
    sqM: number
  }
  valuation: {
    landValueRupees: number
    buildingValueRupees: number
    capitalValueRupees: number
  }
  heads: {
    housePaise: number
    lightingPaise: number
    sanitationPaise: number
    totalPaise: number
    houseRupees: number
    totalRupees: number
  }
  rateConfigured: boolean
}

export type Namuna8ListResponse = {
  items: Namuna8ListItem[]
  count: number
  rateMaster: Namuna8RateMasterStatus
}

type RawNamuna8RateMasterStatus = {
  is_complete: boolean
  missing_property_types: string[]
  incomplete_property_types: string[]
}

type RawNamuna8ListItem = {
  id: string
  property_no: string
  property_type: Namuna8PropertyType | string
  ward_number: string
  owner: {
    citizen_id: string
    citizen_no: number
    name_mr: string
    name_en: string | null
  }
  occupant_name: string
  survey_number: string | null
  plot_or_gat: string | null
  resolution_ref: string | null
  assessment_date: string | null
  age_bracket: string | null
  dimensions: {
    length_ft: number | null
    width_ft: number | null
  }
  ready_reckoner_per_sq_m: {
    land: number
    imarat: number
    bandhkam: number | null
  }
  assessment: {
    depreciation_factor: number
    usage_weightage: number
    tax_rate_paise: number
  }
  area: {
    sq_ft: number
    sq_m: number
  }
  valuation: {
    land_value_rupees: number
    building_value_rupees: number
    capital_value_rupees: number
  }
  heads: {
    house_paise: number
    lighting_paise: number
    sanitation_paise: number
    total_paise: number
    house_rupees: number
    total_rupees: number
  }
  rate_configured: boolean
}

type RawNamuna8ListResponse = {
  items: RawNamuna8ListItem[]
  count: number
  rate_master: RawNamuna8RateMasterStatus
}

function normalizeRateMaster(raw: RawNamuna8RateMasterStatus): Namuna8RateMasterStatus {
  return {
    isComplete: raw.is_complete,
    missingPropertyTypes: raw.missing_property_types,
    incompletePropertyTypes: raw.incomplete_property_types,
  }
}

function normalizeItem(raw: RawNamuna8ListItem): Namuna8ListItem {
  return {
    id: raw.id,
    propertyNo: raw.property_no,
    propertyType: raw.property_type,
    wardNumber: raw.ward_number,
    owner: {
      citizenId: raw.owner.citizen_id,
      citizenNo: raw.owner.citizen_no,
      nameMr: raw.owner.name_mr,
      nameEn: raw.owner.name_en,
    },
    occupantName: raw.occupant_name,
    surveyNumber: raw.survey_number,
    plotOrGat: raw.plot_or_gat,
    resolutionRef: raw.resolution_ref,
    assessmentDate: raw.assessment_date,
    ageBracket: raw.age_bracket ?? null,
    dimensions: raw.dimensions
      ? {
          lengthFt: raw.dimensions.length_ft,
          widthFt: raw.dimensions.width_ft,
        }
      : { lengthFt: null, widthFt: null },
    readyReckonerPerSqM: raw.ready_reckoner_per_sq_m
      ? {
          land: raw.ready_reckoner_per_sq_m.land,
          imarat: raw.ready_reckoner_per_sq_m.imarat,
          bandhkam: raw.ready_reckoner_per_sq_m.bandhkam,
        }
      : { land: 0, imarat: 0, bandhkam: null },
    assessment: raw.assessment
      ? {
          depreciationFactor: raw.assessment.depreciation_factor,
          usageWeightage: raw.assessment.usage_weightage,
          taxRatePaise: raw.assessment.tax_rate_paise,
        }
      : { depreciationFactor: 1, usageWeightage: 1, taxRatePaise: 0.7 },
    area: {
      sqFt: raw.area.sq_ft,
      sqM: raw.area.sq_m,
    },
    valuation: {
      landValueRupees: raw.valuation.land_value_rupees,
      buildingValueRupees: raw.valuation.building_value_rupees,
      capitalValueRupees: raw.valuation.capital_value_rupees,
    },
    heads: {
      housePaise: raw.heads.house_paise,
      lightingPaise: raw.heads.lighting_paise,
      sanitationPaise: raw.heads.sanitation_paise,
      totalPaise: raw.heads.total_paise,
      houseRupees: raw.heads.house_rupees,
      totalRupees: raw.heads.total_rupees,
    },
    rateConfigured: raw.rate_configured,
  }
}

export type ListNamuna8Filters = {
  ward?: string
  q?: string
  propertyType?: Namuna8PropertyType
}

export async function listNamuna8(
  subdomain: string,
  filters: ListNamuna8Filters = {},
  init?: RequestInit
) {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.namune.n08List))
  if (filters.ward) url.searchParams.set('ward', filters.ward)
  if (filters.q) url.searchParams.set('q', filters.q)
  if (filters.propertyType) url.searchParams.set('propertyType', filters.propertyType)
  const raw = await apiFetch<RawNamuna8ListResponse>(url.toString(), { method: 'GET', ...init })
  return {
    items: raw.items.map(normalizeItem),
    count: raw.count,
    rateMaster: normalizeRateMaster(raw.rate_master),
  }
}

export async function getNamuna8Property(subdomain: string, propertyId: string, init?: RequestInit) {
  const raw = await apiFetch<RawNamuna8ListItem & { rate_master: RawNamuna8RateMasterStatus }>(
    buildApiUrl(subdomain, tenantApiPaths.namune.n08ById(propertyId)),
    { method: 'GET', ...init }
  )
  return {
    ...normalizeItem(raw),
    rateMaster: normalizeRateMaster(raw.rate_master),
  }
}
