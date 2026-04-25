import { getGrampanchayatApiBaseUrl } from '@/lib/grampanchayat-api'
import { downloadBlob } from '@/lib/download-blob'

export type MastersTemplateColumnMeta = {
  key: string
  required: boolean
  hint: string
}

export type MastersTemplateMetaResponse = {
  limits: { maxRows: number; maxFileMb: number }
  citizens: { columns: MastersTemplateColumnMeta[] }
  properties: { columns: MastersTemplateColumnMeta[] }
  propertyTypeRates: { columns: MastersTemplateColumnMeta[]; maxRows: number }
  allowed: { propertyTypes: string[]; ageBrackets: string[] }
}

type RawMastersTemplateMetaResponse = {
  limits: { max_rows: number; max_file_mb: number }
  citizens: { columns: MastersTemplateColumnMeta[] }
  properties: { columns: MastersTemplateColumnMeta[] }
  property_type_rates: { columns: MastersTemplateColumnMeta[]; max_rows: number }
  allowed: { property_types: string[]; age_brackets: string[] }
}

/** Matches gp_citizens list row from GET /masters/citizens */
export type MastersCitizenListRow = {
  id: string
  citizenNo: number
  nameMr: string
  nameEn: string | null
  mobile: string
  wardNumber: string
  addressMr: string
  aadhaarLast4: string | null
  householdId: string | null
  createdAt: string
}

type RawMastersCitizenListRow = {
  id: string
  citizen_no: number
  name_mr: string
  name_en: string | null
  mobile: string
  ward_number: string
  address_mr: string
  aadhaar_last4: string | null
  household_id: string | null
  created_at: string
}

/** Matches property list row from GET /masters/properties (join includes owner_citizen_no) */
export type MastersPropertyListRow = {
  id: string
  propertyNo: string
  ownerCitizenNo: number
  propertyType: string
  occupantName: string
  surveyNumber: string | null
  plotOrGat: string | null
  lengthFt: number | null
  widthFt: number | null
  ageBracket: string | null
  resolutionRef: string | null
  assessmentDate: string | null
  lightingTaxPaise: number | null
  sanitationTaxPaise: number | null
  waterTaxPaise: number | null
  createdAt: string
}

type RawMastersPropertyListRow = {
  id: string
  property_no: string
  owner_citizen_no: number
  property_type: string
  occupant_name: string
  survey_number: string | null
  plot_or_gat: string | null
  length_ft: number | null
  width_ft: number | null
  age_bracket: string | null
  resolution_ref: string | null
  assessment_date: string | null
  lighting_tax_paise: number | null
  sanitation_tax_paise: number | null
  water_tax_paise: number | null
  created_at: string
}

export type MastersBulkErrorBody = {
  success?: boolean
  message?: string
  errors?: unknown[]
  requestId?: string
}

function tenantsMastersPath(subdomain: string, tail: string): string {
  const base = getGrampanchayatApiBaseUrl()
  return `${base}/api/v1/tenants/${encodeURIComponent(subdomain)}/masters/${tail}`
}

function normalizeTemplateMeta(raw: RawMastersTemplateMetaResponse): MastersTemplateMetaResponse {
  return {
    limits: {
      maxRows: raw.limits.max_rows,
      maxFileMb: raw.limits.max_file_mb,
    },
    citizens: raw.citizens,
    properties: raw.properties,
    propertyTypeRates: {
      columns: raw.property_type_rates.columns,
      maxRows: raw.property_type_rates.max_rows,
    },
    allowed: {
      propertyTypes: raw.allowed.property_types,
      ageBrackets: raw.allowed.age_brackets,
    },
  }
}

function normalizeCitizenRow(raw: RawMastersCitizenListRow): MastersCitizenListRow {
  return {
    id: raw.id,
    citizenNo: raw.citizen_no,
    nameMr: raw.name_mr,
    nameEn: raw.name_en,
    mobile: raw.mobile,
    wardNumber: raw.ward_number,
    addressMr: raw.address_mr,
    aadhaarLast4: raw.aadhaar_last4,
    householdId: raw.household_id,
    createdAt: raw.created_at,
  }
}

function normalizePropertyRow(raw: RawMastersPropertyListRow): MastersPropertyListRow {
  return {
    id: raw.id,
    propertyNo: raw.property_no,
    ownerCitizenNo: raw.owner_citizen_no,
    propertyType: raw.property_type,
    occupantName: raw.occupant_name,
    surveyNumber: raw.survey_number,
    plotOrGat: raw.plot_or_gat,
    lengthFt: raw.length_ft,
    widthFt: raw.width_ft,
    ageBracket: raw.age_bracket,
    resolutionRef: raw.resolution_ref,
    assessmentDate: raw.assessment_date,
    lightingTaxPaise: raw.lighting_tax_paise,
    sanitationTaxPaise: raw.sanitation_tax_paise,
    waterTaxPaise: raw.water_tax_paise,
    createdAt: raw.created_at,
  }
}

export async function fetchMastersTemplateMeta(
  subdomain: string,
  accessToken: string
): Promise<MastersTemplateMetaResponse> {
  const res = await fetch(tenantsMastersPath(subdomain, 'template-meta'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: RawMastersTemplateMetaResponse
    message?: string
  }
  if (!res.ok || !json.data) {
    throw new Error(json.message ?? `Failed to load template metadata (${String(res.status)})`)
  }
  return normalizeTemplateMeta(json.data)
}

export async function fetchMastersCitizensList(
  subdomain: string,
  accessToken: string
): Promise<MastersCitizenListRow[]> {
  const res = await fetch(tenantsMastersPath(subdomain, 'citizens'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: { items: RawMastersCitizenListRow[] }
    message?: string
  }
  if (!res.ok || !json.data?.items) {
    throw new Error(json.message ?? `Failed to load citizens (${String(res.status)})`)
  }
  return json.data.items.map(normalizeCitizenRow)
}

export async function fetchMastersPropertiesList(
  subdomain: string,
  accessToken: string
): Promise<MastersPropertyListRow[]> {
  const res = await fetch(tenantsMastersPath(subdomain, 'properties'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: { items: RawMastersPropertyListRow[] }
    message?: string
  }
  if (!res.ok || !json.data?.items) {
    throw new Error(json.message ?? `Failed to load properties (${String(res.status)})`)
  }
  return json.data.items.map(normalizePropertyRow)
}

/** GET /masters/property-type-rates (Drizzle numeric fields as strings) */
export type MastersPropertyTypeRateRow = {
  id: string
  gpId: string
  propertyType: string
  minRate: string | null
  maxRate: string | null
  landRatePerSqft: string | null
  constructionRatePerSqft: string | null
  newConstructionRatePerSqft: string | null
  defaultLightingPaise: number | null
  defaultSanitationPaise: number | null
  defaultWaterPaise: number | null
  createdAt: string
  updatedAt: string
}

type RawMastersPropertyTypeRateRow = {
  id: string
  gp_id: string
  property_type: string
  min_rate: string | null
  max_rate: string | null
  land_rate_per_sqft: string | null
  construction_rate_per_sqft: string | null
  new_construction_rate_per_sqft: string | null
  default_lighting_paise: number | null
  default_sanitation_paise: number | null
  default_water_paise: number | null
  created_at: string
  updated_at: string
}

function normalizePropertyTypeRateRow(raw: RawMastersPropertyTypeRateRow): MastersPropertyTypeRateRow {
  return {
    id: raw.id,
    gpId: raw.gp_id,
    propertyType: raw.property_type,
    minRate: raw.min_rate,
    maxRate: raw.max_rate,
    landRatePerSqft: raw.land_rate_per_sqft,
    constructionRatePerSqft: raw.construction_rate_per_sqft,
    newConstructionRatePerSqft: raw.new_construction_rate_per_sqft,
    defaultLightingPaise: raw.default_lighting_paise,
    defaultSanitationPaise: raw.default_sanitation_paise,
    defaultWaterPaise: raw.default_water_paise,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export async function fetchMastersPropertyTypeRatesList(
  subdomain: string,
  accessToken: string
): Promise<MastersPropertyTypeRateRow[]> {
  const res = await fetch(tenantsMastersPath(subdomain, 'property-type-rates'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: RawMastersPropertyTypeRateRow[] | null
    message?: string
  }
  if (!res.ok) {
    throw new Error(json.message ?? `Failed to load property tax rates (${String(res.status)})`)
  }
  const d = json.data
  if (!d) return []
  return Array.isArray(d) ? d.map(normalizePropertyTypeRateRow) : []
}

const DEFAULT_TEMPLATE_NAMES: Record<'citizens' | 'properties' | 'propertyTypeRates', string> = {
  citizens:   'gp-masters-citizens-template.xlsx',
  properties: 'gp-masters-properties-template.xlsx',
  propertyTypeRates: 'gp-masters-property-tax-rates-template.xlsx',
}

export async function downloadMastersTemplateXlsx(
  kind: 'citizens' | 'properties' | 'propertyTypeRates',
  subdomain: string,
  accessToken: string
): Promise<void> {
  const path =
    kind === 'citizens'
      ? 'citizens/template'
      : kind === 'properties'
        ? 'properties/template'
        : 'property-type-rates/template'
  const res = await fetch(tenantsMastersPath(subdomain, path), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `Template download failed (${String(res.status)})`
    try {
      const j = JSON.parse(text) as { message?: string }
      if (j.message) msg = j.message
    } catch {
      if (text) msg = text.slice(0, 200)
    }
    throw new Error(msg)
  }
  const blob     = await res.blob()
  const disp     = res.headers.get('Content-Disposition')
  let filename   = DEFAULT_TEMPLATE_NAMES[kind]
  const m = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(disp ?? '')
  if (m?.[1]) {
    filename = decodeURIComponent(m[1].replace(/"/g, '').trim())
  }
  downloadBlob(blob, {
    filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function postMastersBulk(
  kind: 'citizens' | 'properties' | 'property-type-rates',
  subdomain: string,
  file: File,
  accessToken: string
): Promise<{ data: { inserted: number } | null; message: string }> {
  const base = getGrampanchayatApiBaseUrl()
  const fd   = new FormData()
  fd.append('file', file)
  const path =
    kind === 'property-type-rates' ? 'property-type-rates/bulk' : `${kind}/bulk`
  const res = await fetch(
    `${base}/api/v1/tenants/${encodeURIComponent(subdomain)}/masters/${path}`,
    {
      method:      'POST',
      headers:     { Authorization: `Bearer ${accessToken}` },
      body:        fd,
    }
  )
  const json = (await res.json().catch(() => ({}))) as MastersBulkErrorBody & {
    data?: { inserted: number } | null
    statusCode?: number
  }
  if (!res.ok) {
    const err = new Error(json.message ?? `Upload failed (${String(res.status)})`) as Error & {
      body: MastersBulkErrorBody
      status: number
    }
    err.body = json
    err.status = res.status
    throw err
  }
  return {
    data:    json.data ?? null,
    message: json.message ?? 'OK',
  }
}
