import { apiFetch, buildApiUrl } from './client'
import { tenantApiPaths } from './endpoints'
import type { TaxHead } from '@/lib/tax/heads'

export type Namuna10ReceiptLine = {
  id: string
  demandLineId: string
  amountPaise: number
  taxHead?: TaxHead
}

export type Namuna10Totals = {
  linesTotalPaise: number
  totalPaise: number
}

export type Namuna10Receipt = {
  id: string
  receiptNo: string
  fiscalYear: string
  propertyId: string
  payerName: string
  paidAt: string
  paymentMode: string
  reference: string | null
  discountPaise: number
  lateFeePaise: number
  noticeFeePaise: number
  otherPaise: number
  otherReason: string | null
  isVoid: boolean
  lines: Namuna10ReceiptLine[]
  totals: Namuna10Totals
}

export type Namuna10ReceiptDetail = Namuna10Receipt & {
  property: {
    id: string
    propertyNo: string
    propertyType: string
    wardNumber: string
  }
  owner: {
    nameMr: string
    nameEn: string | null
  }
  voidedAt?: string | null
  voidedBy?: string | null
  voidReason?: string | null
}

export type Namuna10CreateInput = {
  propertyId: string
  payerName: string
  fiscalYear: string
  paidAt: string
  paymentMode: 'cash' | 'upi' | 'cheque' | 'neft' | 'other'
  reference?: string
  lines: Array<{
    demandLineId: string
    amountPaise: number
  }>
  discountPaise?: number
  lateFeePaise?: number
  noticeFeePaise?: number
  otherPaise?: number
  otherReason?: string
}

export type Namuna10ReceiptSummary = {
  id: string
  receiptNo: string
  fiscalYear: string
  propertyId: string
  propertyNo: string
  payerName: string
  paidAt: string
  paymentMode: string
  isVoid: boolean
  totalPaise: number
}

export type Namuna10ListResponse = {
  items: Namuna10ReceiptSummary[]
  limit: number
  offset: number
}

type RawReceiptLine = {
  id: string
  demand_line_id: string
  amount_paise: number
  tax_head?: TaxHead
}

type RawTotals = {
  lines_total_paise: number
  total_paise: number
}

type RawReceipt = {
  id: string
  receipt_no: string
  fiscal_year: string
  property_id: string
  payer_name: string
  paid_at: string
  payment_mode: string
  reference?: string | null
  discount_paise?: number
  late_fee_paise?: number
  notice_fee_paise?: number
  other_paise?: number
  other_reason?: string | null
  is_void?: boolean
  lines: RawReceiptLine[]
  totals: RawTotals
}

type RawReceiptDetail = RawReceipt & {
  property: {
    id: string
    property_no: string
    property_type: string
    ward_number: string
  }
  owner: {
    name_mr: string
    name_en: string | null
  }
  voided_at?: string | null
  voided_by?: string | null
  void_reason?: string | null
}

type RawReceiptSummary = {
  id: string
  receipt_no: string
  fiscal_year: string
  property_id: string
  property_no: string
  payer_name: string
  paid_at: string
  payment_mode: string
  is_void: boolean
  total_paise: number
}

type RawListResponse = {
  items: RawReceiptSummary[]
  limit: number
  offset: number
}

function normalizeLine(raw: RawReceiptLine): Namuna10ReceiptLine {
  return {
    id: raw.id,
    demandLineId: raw.demand_line_id,
    amountPaise: raw.amount_paise,
    taxHead: raw.tax_head,
  }
}

function normalizeReceipt(raw: RawReceipt): Namuna10Receipt {
  return {
    id: raw.id,
    receiptNo: raw.receipt_no,
    fiscalYear: raw.fiscal_year,
    propertyId: raw.property_id,
    payerName: raw.payer_name,
    paidAt: raw.paid_at,
    paymentMode: raw.payment_mode,
    reference: raw.reference ?? null,
    discountPaise: raw.discount_paise ?? 0,
    lateFeePaise: raw.late_fee_paise ?? 0,
    noticeFeePaise: raw.notice_fee_paise ?? 0,
    otherPaise: raw.other_paise ?? 0,
    otherReason: raw.other_reason ?? null,
    isVoid: raw.is_void ?? false,
    lines: raw.lines.map(normalizeLine),
    totals: {
      linesTotalPaise: raw.totals.lines_total_paise,
      totalPaise: raw.totals.total_paise,
    },
  }
}

function normalizeReceiptDetail(raw: RawReceiptDetail): Namuna10ReceiptDetail {
  return {
    ...normalizeReceipt(raw),
    property: {
      id: raw.property.id,
      propertyNo: raw.property.property_no,
      propertyType: raw.property.property_type,
      wardNumber: raw.property.ward_number,
    },
    owner: {
      nameMr: raw.owner.name_mr,
      nameEn: raw.owner.name_en,
    },
    voidedAt: raw.voided_at ?? null,
    voidedBy: raw.voided_by ?? null,
    voidReason: raw.void_reason ?? null,
  }
}

function normalizeReceiptSummary(raw: RawReceiptSummary): Namuna10ReceiptSummary {
  return {
    id: raw.id,
    receiptNo: raw.receipt_no,
    fiscalYear: raw.fiscal_year,
    propertyId: raw.property_id,
    propertyNo: raw.property_no,
    payerName: raw.payer_name,
    paidAt: raw.paid_at,
    paymentMode: raw.payment_mode,
    isVoid: raw.is_void,
    totalPaise: raw.total_paise,
  }
}

export async function createReceipt(
  subdomain: string,
  body: Namuna10CreateInput,
  init?: RequestInit
): Promise<Namuna10Receipt> {
  const raw = await apiFetch<RawReceipt>(
    buildApiUrl(subdomain, tenantApiPaths.namune.n10Create),
    { method: 'POST', body: JSON.stringify(body), ...init }
  )
  return normalizeReceipt(raw)
}

export async function getReceipt(
  subdomain: string,
  id: string,
  init?: RequestInit
): Promise<Namuna10ReceiptDetail> {
  const raw = await apiFetch<RawReceiptDetail>(
    buildApiUrl(subdomain, tenantApiPaths.namune.n10ById(id)),
    { method: 'GET', ...init }
  )
  return normalizeReceiptDetail(raw)
}

export async function listReceipts(
  subdomain: string,
  params?: {
    q?: string
    propertyId?: string
    fiscalYear?: string
    limit?: number
    offset?: number
  },
  init?: RequestInit
): Promise<Namuna10ListResponse> {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.namune.n10List))
  if (params?.q) url.searchParams.set('q', params.q)
  if (params?.propertyId) url.searchParams.set('property_id', params.propertyId)
  if (params?.fiscalYear) url.searchParams.set('fiscal_year', params.fiscalYear)
  if (params?.limit != null) url.searchParams.set('limit', String(params.limit))
  if (params?.offset != null) url.searchParams.set('offset', String(params.offset))

  const raw = await apiFetch<RawListResponse>(url.toString(), { method: 'GET', ...init })
  return {
    items: raw.items.map(normalizeReceiptSummary),
    limit: raw.limit,
    offset: raw.offset,
  }
}
