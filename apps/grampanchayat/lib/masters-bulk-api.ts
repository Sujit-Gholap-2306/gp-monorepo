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

export type MastersImportError = {
  row: number
  field?: string
  message: string
}

export type MastersBulkUploadResult = {
  inserted: number
  skipped?: number
  errors?: MastersImportError[]
}

export type MastersCitizenRecord = {
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
  updatedAt: string
}

type RawMastersCitizenRecord = {
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
  updated_at: string
}

export type MastersCitizenInput = {
  nameMr: string
  nameEn?: string
  mobile: string
  wardNumber: string
  addressMr: string
  aadhaarLast4?: string
  householdId?: string
}

export type MastersPropertyRecord = {
  id: string
  propertyNo: string
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
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    citizenNo: number
    nameMr: string
    nameEn: string | null
    wardNumber: string
  }
}

type RawMastersPropertyRecord = {
  id: string
  property_no: string
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
  created_at: string
  updated_at: string
  owner: {
    id: string
    citizen_no: number
    name_mr: string
    name_en: string | null
    ward_number: string
  }
}

export type MastersPropertyInput = {
  ownerCitizenId: string
  propertyType: string
  occupantName: string
  surveyNumber?: string
  plotOrGat?: string
  lengthFt?: number | null
  widthFt?: number | null
  ageBracket?: string
  resolutionRef?: string
  assessmentDate?: string
  lightingTaxPaise?: number | null
  sanitationTaxPaise?: number | null
}

export type MastersPropertyUpdateInput = Omit<MastersPropertyInput, 'ownerCitizenId'>

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
  created_at: string
  updated_at: string
}

export type MastersPropertyTypeRateInput = {
  propertyType: string
  minRate?: number | null
  maxRate?: number | null
  landRatePerSqft?: number | null
  constructionRatePerSqft?: number | null
  newConstructionRatePerSqft?: number | null
  defaultLightingPaise?: number | null
  defaultSanitationPaise?: number | null
}

export type MastersWaterConnectionRecord = {
  id: string
  consumerNo: string
  connectionType: string
  pipeSizeInch: number
  status: string
  connectedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  citizen: {
    id: string
    citizenNo: number
    nameMr: string
    nameEn: string | null
    wardNumber: string
  }
}

type RawMastersWaterConnectionRecord = {
  id: string
  consumer_no: string
  connection_type: string
  pipe_size_inch: number
  status: string
  connected_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  citizen: {
    id: string
    citizen_no: number
    name_mr: string
    name_en: string | null
    ward_number: string
  }
}

export type MastersWaterConnectionInput = {
  citizenId: string
  connectionType: string
  pipeSizeInch: number
  connectedAt?: string
  notes?: string
}

export type MastersWaterConnectionUpdateInput = {
  connectedAt?: string
  notes?: string
}

export type MastersWaterConnectionRateRow = {
  id: string
  gpId: string
  fiscalYear: string
  connectionType: string
  pipeSizeInch: number
  annualPaise: number
  createdAt: string
  updatedAt: string
}

type RawMastersWaterConnectionRateRow = {
  id: string
  gp_id: string
  fiscal_year: string
  connection_type: string
  pipe_size_inch: number
  annual_paise: number
  created_at: string
  updated_at: string
}

export type MastersWaterConnectionRateInput = {
  fiscalYear: string
  connectionType: string
  pipeSizeInch: number
  annualPaise: number
}

export type MastersBulkErrorBody = {
  success?: boolean
  message?: string
  errors?: unknown[]
  requestId?: string
}

type ApiEnvelope<T> = {
  data?: T
  message?: string
}

function tenantsMastersPath(subdomain: string, tail: string): string {
  const base = getGrampanchayatApiBaseUrl()
  return `${base}/api/v1/tenants/${encodeURIComponent(subdomain)}/masters/${tail}`
}

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const url = new URL(path)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }
  return url.toString()
}

async function parseJson<T>(res: Response): Promise<ApiEnvelope<T>> {
  return (await res.json().catch(() => ({}))) as ApiEnvelope<T>
}

async function expectData<T>(res: Response, fallback: string): Promise<T> {
  const json = await parseJson<T>(res)
  if (!res.ok || json.data == null) {
    throw new Error(json.message ?? fallback)
  }
  return json.data
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

function normalizeCitizen(raw: RawMastersCitizenRecord): MastersCitizenRecord {
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
    updatedAt: raw.updated_at,
  }
}

function normalizeProperty(raw: RawMastersPropertyRecord): MastersPropertyRecord {
  return {
    id: raw.id,
    propertyNo: raw.property_no,
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
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    owner: {
      id: raw.owner.id,
      citizenNo: raw.owner.citizen_no,
      nameMr: raw.owner.name_mr,
      nameEn: raw.owner.name_en,
      wardNumber: raw.owner.ward_number,
    },
  }
}

function normalizePropertyTypeRate(raw: RawMastersPropertyTypeRateRow): MastersPropertyTypeRateRow {
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
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

function normalizeWaterConnection(raw: RawMastersWaterConnectionRecord): MastersWaterConnectionRecord {
  return {
    id: raw.id,
    consumerNo: raw.consumer_no,
    connectionType: raw.connection_type,
    pipeSizeInch: raw.pipe_size_inch,
    status: raw.status,
    connectedAt: raw.connected_at,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    citizen: {
      id: raw.citizen.id,
      citizenNo: raw.citizen.citizen_no,
      nameMr: raw.citizen.name_mr,
      nameEn: raw.citizen.name_en,
      wardNumber: raw.citizen.ward_number,
    },
  }
}

function normalizeWaterConnectionRate(raw: RawMastersWaterConnectionRateRow): MastersWaterConnectionRateRow {
  return {
    id: raw.id,
    gpId: raw.gp_id,
    fiscalYear: raw.fiscal_year,
    connectionType: raw.connection_type,
    pipeSizeInch: raw.pipe_size_inch,
    annualPaise: raw.annual_paise,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

const DEFAULT_TEMPLATE_NAMES: Record<'citizens' | 'properties' | 'propertyTypeRates', string> = {
  citizens: 'gp-masters-citizens-template.xlsx',
  properties: 'gp-masters-properties-template.xlsx',
  propertyTypeRates: 'gp-masters-property-tax-rates-template.xlsx',
}

export async function fetchMastersTemplateMeta(
  subdomain: string,
  accessToken: string
): Promise<MastersTemplateMetaResponse> {
  const data = await expectData<RawMastersTemplateMetaResponse>(
    await fetch(tenantsMastersPath(subdomain, 'template-meta'), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    'Failed to load template metadata'
  )
  return normalizeTemplateMeta(data)
}

export async function fetchMastersCitizensList(
  subdomain: string,
  accessToken: string,
  filters: { q?: string; ward?: string } = {}
): Promise<MastersCitizenRecord[]> {
  const data = await expectData<{ items: RawMastersCitizenRecord[] }>(
    await fetch(
      withQuery(tenantsMastersPath(subdomain, 'citizens'), {
        q: filters.q,
        ward: filters.ward,
      }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),
    'Failed to load citizens'
  )
  return data.items.map(normalizeCitizen)
}

export async function fetchMastersCitizenById(
  subdomain: string,
  citizenId: string,
  accessToken: string
): Promise<MastersCitizenRecord> {
  const data = await expectData<RawMastersCitizenRecord>(
    await fetch(tenantsMastersPath(subdomain, `citizens/${encodeURIComponent(citizenId)}`), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    'Failed to load citizen'
  )
  return normalizeCitizen(data)
}

export async function createMastersCitizen(
  subdomain: string,
  input: MastersCitizenInput,
  accessToken: string
): Promise<MastersCitizenRecord> {
  const data = await expectData<RawMastersCitizenRecord>(
    await fetch(tenantsMastersPath(subdomain, 'citizens'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name_mr: input.nameMr,
        name_en: input.nameEn || undefined,
        mobile: input.mobile,
        ward_number: input.wardNumber,
        address_mr: input.addressMr,
        aadhaar_last4: input.aadhaarLast4 || undefined,
        household_id: input.householdId || undefined,
      }),
    }),
    'Failed to create citizen'
  )
  return normalizeCitizen(data)
}

export async function updateMastersCitizen(
  subdomain: string,
  citizenId: string,
  input: Partial<MastersCitizenInput>,
  accessToken: string
): Promise<MastersCitizenRecord> {
  const data = await expectData<RawMastersCitizenRecord>(
    await fetch(tenantsMastersPath(subdomain, `citizens/${encodeURIComponent(citizenId)}`), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name_mr: input.nameMr,
        name_en: input.nameEn,
        mobile: input.mobile,
        ward_number: input.wardNumber,
        address_mr: input.addressMr,
        aadhaar_last4: input.aadhaarLast4,
        household_id: input.householdId,
      }),
    }),
    'Failed to update citizen'
  )
  return normalizeCitizen(data)
}

export async function fetchMastersPropertiesList(
  subdomain: string,
  accessToken: string,
  filters: { q?: string; ward?: string; propertyType?: string } = {}
): Promise<MastersPropertyRecord[]> {
  const data = await expectData<{ items: RawMastersPropertyRecord[] }>(
    await fetch(
      withQuery(tenantsMastersPath(subdomain, 'properties'), {
        q: filters.q,
        ward: filters.ward,
        property_type: filters.propertyType,
      }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),
    'Failed to load properties'
  )
  return data.items.map(normalizeProperty)
}

export async function fetchMastersPropertyById(
  subdomain: string,
  propertyId: string,
  accessToken: string
): Promise<MastersPropertyRecord> {
  const data = await expectData<RawMastersPropertyRecord>(
    await fetch(tenantsMastersPath(subdomain, `properties/${encodeURIComponent(propertyId)}`), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    'Failed to load property'
  )
  return normalizeProperty(data)
}

export async function createMastersProperty(
  subdomain: string,
  input: MastersPropertyInput,
  accessToken: string
): Promise<MastersPropertyRecord> {
  const data = await expectData<RawMastersPropertyRecord>(
    await fetch(tenantsMastersPath(subdomain, 'properties'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner_citizen_id: input.ownerCitizenId,
        property_type: input.propertyType,
        occupant_name: input.occupantName,
        survey_number: input.surveyNumber || undefined,
        plot_or_gat: input.plotOrGat || undefined,
        length_ft: input.lengthFt ?? undefined,
        width_ft: input.widthFt ?? undefined,
        age_bracket: input.ageBracket || undefined,
        resolution_ref: input.resolutionRef || undefined,
        assessment_date: input.assessmentDate || undefined,
        lighting_tax_paise: input.lightingTaxPaise ?? undefined,
        sanitation_tax_paise: input.sanitationTaxPaise ?? undefined,
      }),
    }),
    'Failed to create property'
  )
  return normalizeProperty(data)
}

export async function updateMastersProperty(
  subdomain: string,
  propertyId: string,
  input: Partial<MastersPropertyUpdateInput>,
  accessToken: string
): Promise<MastersPropertyRecord> {
  const data = await expectData<RawMastersPropertyRecord>(
    await fetch(tenantsMastersPath(subdomain, `properties/${encodeURIComponent(propertyId)}`), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        property_type: input.propertyType,
        occupant_name: input.occupantName,
        survey_number: input.surveyNumber,
        plot_or_gat: input.plotOrGat,
        length_ft: input.lengthFt,
        width_ft: input.widthFt,
        age_bracket: input.ageBracket,
        resolution_ref: input.resolutionRef,
        assessment_date: input.assessmentDate,
        lighting_tax_paise: input.lightingTaxPaise,
        sanitation_tax_paise: input.sanitationTaxPaise,
      }),
    }),
    'Failed to update property'
  )
  return normalizeProperty(data)
}

export async function fetchMastersPropertyTypeRatesList(
  subdomain: string,
  accessToken: string
): Promise<MastersPropertyTypeRateRow[]> {
  const data = await expectData<RawMastersPropertyTypeRateRow[] | null>(
    await fetch(tenantsMastersPath(subdomain, 'property-type-rates'), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    'Failed to load property tax rates'
  )
  return (data ?? []).map(normalizePropertyTypeRate)
}

export async function saveMastersPropertyTypeRates(
  subdomain: string,
  rows: MastersPropertyTypeRateInput[],
  accessToken: string
): Promise<MastersPropertyTypeRateRow[]> {
  const data = await expectData<RawMastersPropertyTypeRateRow[]>(
    await fetch(tenantsMastersPath(subdomain, 'property-type-rates'), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rates: rows.map((row) => ({
          property_type: row.propertyType,
          min_rate: row.minRate ?? null,
          max_rate: row.maxRate ?? null,
          land_rate_per_sqft: row.landRatePerSqft ?? null,
          construction_rate_per_sqft: row.constructionRatePerSqft ?? null,
          new_construction_rate_per_sqft: row.newConstructionRatePerSqft ?? null,
          default_lighting_paise: row.defaultLightingPaise ?? null,
          default_sanitation_paise: row.defaultSanitationPaise ?? null,
        })),
      }),
    }),
    'Failed to save property tax rates'
  )
  return data.map(normalizePropertyTypeRate)
}

export async function fetchMastersWaterConnectionsList(
  subdomain: string,
  accessToken: string,
  filters: { q?: string; status?: string; connectionType?: string; citizenNo?: string } = {}
): Promise<MastersWaterConnectionRecord[]> {
  const data = await expectData<{ items: RawMastersWaterConnectionRecord[] }>(
    await fetch(
      withQuery(tenantsMastersPath(subdomain, 'water-connections'), {
        q: filters.q,
        status: filters.status,
        connectionType: filters.connectionType,
        citizenNo: filters.citizenNo,
      }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),
    'Failed to load water connections'
  )
  return data.items.map(normalizeWaterConnection)
}

export async function fetchMastersWaterConnectionById(
  subdomain: string,
  id: string,
  accessToken: string
): Promise<MastersWaterConnectionRecord> {
  const data = await expectData<RawMastersWaterConnectionRecord>(
    await fetch(tenantsMastersPath(subdomain, `water-connections/${encodeURIComponent(id)}`), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    'Failed to load water connection'
  )
  return normalizeWaterConnection(data)
}

export async function createMastersWaterConnection(
  subdomain: string,
  input: MastersWaterConnectionInput,
  accessToken: string
): Promise<MastersWaterConnectionRecord> {
  const data = await expectData<RawMastersWaterConnectionRecord>(
    await fetch(tenantsMastersPath(subdomain, 'water-connections'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        citizenId: input.citizenId,
        connectionType: input.connectionType,
        pipeSizeInch: input.pipeSizeInch,
        connectedAt: input.connectedAt || undefined,
        notes: input.notes || undefined,
      }),
    }),
    'Failed to create water connection'
  )
  return normalizeWaterConnection(data)
}

export async function updateMastersWaterConnection(
  subdomain: string,
  id: string,
  input: MastersWaterConnectionUpdateInput,
  accessToken: string
): Promise<MastersWaterConnectionRecord> {
  const data = await expectData<RawMastersWaterConnectionRecord>(
    await fetch(tenantsMastersPath(subdomain, `water-connections/${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectedAt: input.connectedAt,
        notes: input.notes,
      }),
    }),
    'Failed to update water connection'
  )
  return normalizeWaterConnection(data)
}

export async function setMastersWaterConnectionStatus(
  subdomain: string,
  id: string,
  status: string,
  accessToken: string
): Promise<MastersWaterConnectionRecord> {
  const data = await expectData<RawMastersWaterConnectionRecord>(
    await fetch(tenantsMastersPath(subdomain, `water-connections/${encodeURIComponent(id)}/status`), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }),
    'Failed to update water connection status'
  )
  return normalizeWaterConnection(data)
}

export async function fetchMastersWaterConnectionRatesList(
  subdomain: string,
  accessToken: string,
  filters: { fiscalYear?: string } = {}
): Promise<MastersWaterConnectionRateRow[]> {
  const data = await expectData<{ items: RawMastersWaterConnectionRateRow[] }>(
    await fetch(
      withQuery(tenantsMastersPath(subdomain, 'water-connection-rates'), {
        fiscal_year: filters.fiscalYear,
      }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),
    'Failed to load water rates'
  )
  return data.items.map(normalizeWaterConnectionRate)
}

export async function saveMastersWaterConnectionRates(
  subdomain: string,
  rows: MastersWaterConnectionRateInput[],
  accessToken: string
): Promise<MastersWaterConnectionRateRow[]> {
  const data = await expectData<{ items: RawMastersWaterConnectionRateRow[] }>(
    await fetch(tenantsMastersPath(subdomain, 'water-connection-rates'), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rates: rows.map((row) => ({
          fiscal_year: row.fiscalYear,
          connection_type: row.connectionType,
          pipe_size_inch: row.pipeSizeInch,
          annual_paise: row.annualPaise,
        })),
      }),
    }),
    'Failed to save water rates'
  )
  return data.items.map(normalizeWaterConnectionRate)
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

  const blob = await res.blob()
  const disp = res.headers.get('Content-Disposition')
  let filename = DEFAULT_TEMPLATE_NAMES[kind]
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
): Promise<{ data: MastersBulkUploadResult | null; message: string }> {
  const base = getGrampanchayatApiBaseUrl()
  const fd = new FormData()
  fd.append('file', file)
  const path = kind === 'property-type-rates' ? 'property-type-rates/bulk' : `${kind}/bulk`

  const res = await fetch(`${base}/api/v1/tenants/${encodeURIComponent(subdomain)}/masters/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fd,
  })

  const json = (await res.json().catch(() => ({}))) as MastersBulkErrorBody & {
    data?: MastersBulkUploadResult | null
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
    data: json.data ?? null,
    message: json.message ?? 'OK',
  }
}
