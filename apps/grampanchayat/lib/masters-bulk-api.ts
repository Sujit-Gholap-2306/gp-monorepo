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

/** Matches gp_citizens list row from GET /masters/citizens */
export type MastersCitizenListRow = {
  id: string
  citizenNo: number
  nameMr: string
  mobile: string
  wardNumber: string
  addressMr: string
  createdAt: string
}

/** Matches property list row from GET /masters/properties (join includes owner_citizen_no) */
export type MastersPropertyListRow = {
  id: string
  propertyNo: string
  ownerCitizenNo: number
  propertyType: string
  occupantName: string
  surveyNumber: string | null
  createdAt: string
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

export async function fetchMastersTemplateMeta(
  subdomain: string,
  accessToken: string
): Promise<MastersTemplateMetaResponse> {
  const res = await fetch(tenantsMastersPath(subdomain, 'template-meta'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: MastersTemplateMetaResponse
    message?: string
  }
  if (!res.ok || !json.data) {
    throw new Error(json.message ?? `Failed to load template metadata (${String(res.status)})`)
  }
  return json.data
}

export async function fetchMastersCitizensList(
  subdomain: string,
  accessToken: string
): Promise<MastersCitizenListRow[]> {
  const res = await fetch(tenantsMastersPath(subdomain, 'citizens'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: { items: MastersCitizenListRow[] }
    message?: string
  }
  if (!res.ok || !json.data?.items) {
    throw new Error(json.message ?? `Failed to load citizens (${String(res.status)})`)
  }
  return json.data.items
}

export async function fetchMastersPropertiesList(
  subdomain: string,
  accessToken: string
): Promise<MastersPropertyListRow[]> {
  const res = await fetch(tenantsMastersPath(subdomain, 'properties'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: { items: MastersPropertyListRow[] }
    message?: string
  }
  if (!res.ok || !json.data?.items) {
    throw new Error(json.message ?? `Failed to load properties (${String(res.status)})`)
  }
  return json.data.items
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
  createdAt: string
  updatedAt: string
}

export async function fetchMastersPropertyTypeRatesList(
  subdomain: string,
  accessToken: string
): Promise<MastersPropertyTypeRateRow[]> {
  const res = await fetch(tenantsMastersPath(subdomain, 'property-type-rates'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: MastersPropertyTypeRateRow[] | null
    message?: string
  }
  if (!res.ok) {
    throw new Error(json.message ?? `Failed to load property tax rates (${String(res.status)})`)
  }
  const d = json.data
  if (!d) return []
  return Array.isArray(d) ? d : []
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
