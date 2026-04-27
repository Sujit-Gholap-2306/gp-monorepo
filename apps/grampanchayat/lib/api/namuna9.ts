import { apiFetch, buildApiUrl } from './client'
import { tenantApiPaths } from './endpoints'
import type { TaxHead } from '@/lib/tax/heads'
import { downloadBlob } from '@/lib/download-blob'

export type Namuna9Status = 'pending' | 'partial' | 'paid'

export type Namuna9DemandLine = {
  id: string
  taxHead: TaxHead
  previousPaise: number
  currentPaise: number
  paidPaise: number
  totalDuePaise: number
  status: Namuna9Status
}

export type Namuna9DemandTotals = {
  previousPaise: number
  currentPaise: number
  paidPaise: number
  totalDuePaise: number
}

export type Namuna9Demand = {
  id: string
  fiscalYear: string
  generatedAt: string
  property: {
    id: string
    propertyNo: string
    propertyType: string
    wardNumber: string
  }
  owner: {
    citizenNo: number
    nameMr: string
    nameEn: string | null
  }
  lines: Namuna9DemandLine[]
  totals: Namuna9DemandTotals
  status: Namuna9Status
}

export type Namuna9ListResponse = {
  fiscalYear: string
  items: Namuna9Demand[]
  count: number
  totals: Namuna9DemandTotals
}

export type Namuna9CitizenSummary = {
  citizenNo: number
  nameMr: string
  nameEn: string | null
  wardNumber: string
  propertyCount: number
  totals: Namuna9DemandTotals
  status: Namuna9Status
}

export type Namuna9CitizenListResponse = {
  fiscalYear: string
  items: Namuna9CitizenSummary[]
  count: number
  totals: Namuna9DemandTotals
}

export type Namuna9GenerateResponse = {
  fiscalYear: string
  headersGenerated: number
  headersSkipped: number
  totalDemandPaise: number
}

export type Namuna9OpeningImportSummary = {
  rowsInFile: number
  propertiesInFile: number
  updatedProperties: number
  failedProperties: number
}

export type Namuna9OpeningImportUpdatedRow = {
  propertyNo: string
  demandId: string
}

export type Namuna9OpeningImportFailedRow = {
  propertyNo: string
  rowNos: number[]
  reason: string
}

export type Namuna9OpeningImportResponse = {
  fiscalYear: string
  summary: Namuna9OpeningImportSummary
  updated: Namuna9OpeningImportUpdatedRow[]
  failed: Namuna9OpeningImportFailedRow[]
}

export type Namuna9BulkErrorBody = {
  success?: boolean
  message?: string
  errors?: unknown[]
  requestId?: string
}

type RawNamuna9DemandLine = {
  id: string
  tax_head: TaxHead
  previous_paise: number
  current_paise: number
  paid_paise: number
  total_due_paise: number
  status: Namuna9Status
}

type RawNamuna9DemandTotals = {
  previous_paise: number
  current_paise: number
  paid_paise: number
  total_due_paise: number
}

type RawNamuna9Demand = {
  id: string
  fiscal_year: string
  generated_at: string
  property: {
    id: string
    property_no: string
    property_type: string
    ward_number: string
  }
  owner: {
    citizen_no: number
    name_mr: string
    name_en: string | null
  }
  lines: RawNamuna9DemandLine[]
  totals: RawNamuna9DemandTotals
  status: Namuna9Status
}

type RawNamuna9ListResponse = {
  fiscal_year: string
  items: RawNamuna9Demand[]
  count: number
  totals: RawNamuna9DemandTotals
}

type RawNamuna9CitizenSummary = {
  citizen_no: number
  name_mr: string
  name_en: string | null
  ward_number: string
  property_count: number
  totals: RawNamuna9DemandTotals
  status: Namuna9Status
}

type RawNamuna9CitizenListResponse = {
  fiscal_year: string
  items: RawNamuna9CitizenSummary[]
  count: number
  totals: RawNamuna9DemandTotals
}

type RawNamuna9GenerateResponse = {
  fiscal_year: string
  headers_generated: number
  headers_skipped: number
  total_demand_paise: number
}

type RawNamuna9OpeningImportSummary = {
  rows_in_file: number
  properties_in_file: number
  updated_properties: number
  failed_properties: number
}

type RawNamuna9OpeningImportUpdatedRow = {
  property_no: string
  demand_id: string
}

type RawNamuna9OpeningImportFailedRow = {
  property_no: string
  row_nos: number[]
  reason: string
}

type RawNamuna9OpeningImportResponse = {
  fiscal_year: string
  summary: RawNamuna9OpeningImportSummary
  updated: RawNamuna9OpeningImportUpdatedRow[]
  failed: RawNamuna9OpeningImportFailedRow[]
}

export type ListNamuna9Filters = {
  fiscalYear?: string
  ward?: string
  q?: string
  status?: Namuna9Status
  citizenNo?: number
  propertyId?: string
}

export type Namuna9OpeningTemplateMode = 'blank' | 'properties'

function normalizeOpeningImport(raw: RawNamuna9OpeningImportResponse): Namuna9OpeningImportResponse {
  return {
    fiscalYear: raw.fiscal_year,
    summary: {
      rowsInFile: raw.summary.rows_in_file,
      propertiesInFile: raw.summary.properties_in_file,
      updatedProperties: raw.summary.updated_properties,
      failedProperties: raw.summary.failed_properties,
    },
    updated: raw.updated.map((row) => ({
      propertyNo: row.property_no,
      demandId: row.demand_id,
    })),
    failed: raw.failed.map((row) => ({
      propertyNo: row.property_no,
      rowNos: row.row_nos,
      reason: row.reason,
    })),
  }
}

function normalizeTotals(raw: RawNamuna9DemandTotals): Namuna9DemandTotals {
  return {
    previousPaise: raw.previous_paise,
    currentPaise: raw.current_paise,
    paidPaise: raw.paid_paise,
    totalDuePaise: raw.total_due_paise,
  }
}

function normalizeDemand(raw: RawNamuna9Demand): Namuna9Demand {
  return {
    id: raw.id,
    fiscalYear: raw.fiscal_year,
    generatedAt: raw.generated_at,
    property: {
      id: raw.property.id,
      propertyNo: raw.property.property_no,
      propertyType: raw.property.property_type,
      wardNumber: raw.property.ward_number,
    },
    owner: {
      citizenNo: raw.owner.citizen_no,
      nameMr: raw.owner.name_mr,
      nameEn: raw.owner.name_en,
    },
    lines: raw.lines.map((line) => ({
      id: line.id,
      taxHead: line.tax_head,
      previousPaise: line.previous_paise,
      currentPaise: line.current_paise,
      paidPaise: line.paid_paise,
      totalDuePaise: line.total_due_paise,
      status: line.status,
    })),
    totals: normalizeTotals(raw.totals),
    status: raw.status,
  }
}

function normalizeCitizenSummary(raw: RawNamuna9CitizenSummary): Namuna9CitizenSummary {
  return {
    citizenNo: raw.citizen_no,
    nameMr: raw.name_mr,
    nameEn: raw.name_en,
    wardNumber: raw.ward_number,
    propertyCount: raw.property_count,
    totals: normalizeTotals(raw.totals),
    status: raw.status,
  }
}

export async function listNamuna9(
  subdomain: string,
  filters: ListNamuna9Filters = {},
  init?: RequestInit
): Promise<Namuna9ListResponse> {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.namune.n09List))
  if (filters.fiscalYear) url.searchParams.set('fiscalYear', filters.fiscalYear)
  if (filters.ward) url.searchParams.set('ward', filters.ward)
  if (filters.q) url.searchParams.set('q', filters.q)
  if (filters.status) url.searchParams.set('status', filters.status)
  if (filters.citizenNo != null) url.searchParams.set('citizenNo', String(filters.citizenNo))
  if (filters.propertyId) url.searchParams.set('propertyId', filters.propertyId)

  const raw = await apiFetch<RawNamuna9ListResponse>(url.toString(), { method: 'GET', ...init })
  return {
    fiscalYear: raw.fiscal_year,
    items: raw.items.map(normalizeDemand),
    count: raw.count,
    totals: normalizeTotals(raw.totals),
  }
}

export async function listNamuna9Citizens(
  subdomain: string,
  filters: ListNamuna9Filters = {},
  init?: RequestInit
): Promise<Namuna9CitizenListResponse> {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.namune.n09Citizens))
  if (filters.fiscalYear) url.searchParams.set('fiscalYear', filters.fiscalYear)
  if (filters.ward) url.searchParams.set('ward', filters.ward)
  if (filters.q) url.searchParams.set('q', filters.q)
  if (filters.status) url.searchParams.set('status', filters.status)

  const raw = await apiFetch<RawNamuna9CitizenListResponse>(url.toString(), { method: 'GET', ...init })
  return {
    fiscalYear: raw.fiscal_year,
    items: raw.items.map(normalizeCitizenSummary),
    count: raw.count,
    totals: normalizeTotals(raw.totals),
  }
}

export async function getNamuna9Demand(
  subdomain: string,
  demandId: string,
  init?: RequestInit
): Promise<Namuna9Demand> {
  const raw = await apiFetch<RawNamuna9Demand>(
    buildApiUrl(subdomain, tenantApiPaths.namune.n09ById(demandId)),
    { method: 'GET', ...init }
  )
  return normalizeDemand(raw)
}

export async function generateNamuna9(
  subdomain: string,
  fiscalYear?: string,
  init?: RequestInit
): Promise<Namuna9GenerateResponse> {
  const raw = await apiFetch<RawNamuna9GenerateResponse>(
    buildApiUrl(subdomain, tenantApiPaths.namune.n09Generate),
    {
      method: 'POST',
      body: JSON.stringify({ fiscalYear }),
      ...init,
    }
  )
  return {
    fiscalYear: raw.fiscal_year,
    headersGenerated: raw.headers_generated,
    headersSkipped: raw.headers_skipped,
    totalDemandPaise: raw.total_demand_paise,
  }
}

export async function downloadNamuna9OpeningTemplate(
  subdomain: string,
  mode: Namuna9OpeningTemplateMode = 'blank',
  fiscalYear?: string,
  init?: RequestInit
): Promise<void> {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.namune.n09OpeningTemplate))
  url.searchParams.set('mode', mode)
  if (fiscalYear) url.searchParams.set('fiscalYear', fiscalYear)
  const res = await fetch(
    url.toString(),
    {
      method: 'GET',
      ...init,
      credentials: 'include',
    }
  )
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `Template download failed (${String(res.status)})`
    try {
      const parsed = JSON.parse(text) as { message?: string }
      if (parsed.message) msg = parsed.message
    } catch {
      if (text) msg = text.slice(0, 200)
    }
    throw new Error(msg)
  }

  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  let filename = 'gp-namuna9-opening-balances-template.xlsx'
  const match = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(disposition ?? '')
  if (match?.[1]) {
    filename = decodeURIComponent(match[1].replace(/"/g, '').trim())
  }
  downloadBlob(blob, {
    filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

type ImportNamuna9OpeningArgs = {
  file: File
  fiscalYear?: string
}

export async function importNamuna9OpeningBalances(
  subdomain: string,
  args: ImportNamuna9OpeningArgs,
  init?: RequestInit
): Promise<Namuna9OpeningImportResponse> {
  const fd = new FormData()
  fd.append('file', args.file)
  if (args.fiscalYear) fd.append('fiscalYear', args.fiscalYear)

  const headers = new Headers(init?.headers)
  headers.delete('Content-Type')

  const res = await fetch(
    buildApiUrl(subdomain, tenantApiPaths.namune.n09OpeningBalances),
    {
      ...init,
      method: 'POST',
      headers,
      body: fd,
      credentials: 'include',
    }
  )

  const json = (await res.json().catch(() => ({}))) as Namuna9BulkErrorBody & {
    data?: RawNamuna9OpeningImportResponse
  }
  if (!res.ok || !json.data) {
    const err = new Error(json.message ?? `Opening import failed (${String(res.status)})`) as Error & {
      body: Namuna9BulkErrorBody
      status: number
    }
    err.body = json
    err.status = res.status
    throw err
  }
  return normalizeOpeningImport(json.data)
}
