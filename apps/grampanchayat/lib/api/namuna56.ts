import { apiFetch, buildApiUrl } from './client'
import { tenantApiPaths } from './endpoints'
import type { GpAccountHead } from '@/lib/tax/heads'

export type Namuna5Entry = {
  id: string
  gpId: string
  entryDate: string
  fiscalYear: string
  fyMonthNo: number
  entryType: 'credit' | 'debit'
  accountHead: GpAccountHead
  description: string | null
  amountPaise: number
  sourceType: string
  sourceId: string | null
  sourceLineId: string | null
  createdBy: string
  runningBalancePaise: number
}

export type Namuna5ListResponse = {
  fiscalYear: string
  filters: {
    from: string | null
    to: string | null
    head: GpAccountHead | null
  }
  count: number
  totals: {
    creditPaise: number
    debitPaise: number
    netPaise: number
  }
  items: Namuna5Entry[]
}

export type Namuna6HeadRow = {
  accountHead: GpAccountHead
  dayTotalsPaise: Array<number | null>
  monthTotalPaise: number
  fyRunningPaise: number
}

export type Namuna6ListResponse = {
  fiscalYear: string
  fyMonthNo: number
  monthLabel: string
  daysInMonth: number
  items: Namuna6HeadRow[]
}

type RawNamuna5Entry = {
  id: string
  gp_id: string
  entry_date: string
  fiscal_year: string
  fy_month_no: number
  entry_type: 'credit' | 'debit'
  account_head: GpAccountHead
  description: string | null
  amount_paise: number
  source_type: string
  source_id: string | null
  source_line_id: string | null
  created_by: string
  running_balance_paise: number
}

type RawNamuna5ListResponse = {
  fiscal_year: string
  filters: {
    from: string | null
    to: string | null
    head: GpAccountHead | null
  }
  count: number
  totals: {
    credit_paise: number
    debit_paise: number
    net_paise: number
  }
  items: RawNamuna5Entry[]
}

type RawNamuna6HeadRow = {
  account_head: GpAccountHead
  day_totals_paise: Array<number | null>
  month_total_paise: number
  fy_running_paise: number
}

type RawNamuna6ListResponse = {
  fiscal_year: string
  fy_month_no: number
  month_label: string
  days_in_month: number
  items: RawNamuna6HeadRow[]
}

function normalizeNamuna5Entry(raw: RawNamuna5Entry): Namuna5Entry {
  return {
    id: raw.id,
    gpId: raw.gp_id,
    entryDate: raw.entry_date,
    fiscalYear: raw.fiscal_year,
    fyMonthNo: raw.fy_month_no,
    entryType: raw.entry_type,
    accountHead: raw.account_head,
    description: raw.description,
    amountPaise: raw.amount_paise,
    sourceType: raw.source_type,
    sourceId: raw.source_id,
    sourceLineId: raw.source_line_id,
    createdBy: raw.created_by,
    runningBalancePaise: raw.running_balance_paise,
  }
}

export async function listNamuna5(
  subdomain: string,
  params?: {
    fiscalYear?: string
    from?: string
    to?: string
    head?: GpAccountHead
    limit?: number
  },
  init?: RequestInit
): Promise<Namuna5ListResponse> {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.namune.n05List))
  if (params?.fiscalYear) url.searchParams.set('fiscalYear', params.fiscalYear)
  if (params?.from) url.searchParams.set('from', params.from)
  if (params?.to) url.searchParams.set('to', params.to)
  if (params?.head) url.searchParams.set('head', params.head)
  if (params?.limit != null) url.searchParams.set('limit', String(params.limit))

  const raw = await apiFetch<RawNamuna5ListResponse>(url.toString(), { method: 'GET', ...init })
  return {
    fiscalYear: raw.fiscal_year,
    filters: raw.filters,
    count: raw.count,
    totals: {
      creditPaise: raw.totals.credit_paise,
      debitPaise: raw.totals.debit_paise,
      netPaise: raw.totals.net_paise,
    },
    items: raw.items.map(normalizeNamuna5Entry),
  }
}

export async function listNamuna6(
  subdomain: string,
  params?: {
    fiscalYear?: string
    month?: number
  },
  init?: RequestInit
): Promise<Namuna6ListResponse> {
  const url = new URL(buildApiUrl(subdomain, tenantApiPaths.namune.n06List))
  if (params?.fiscalYear) url.searchParams.set('fiscalYear', params.fiscalYear)
  if (params?.month != null) url.searchParams.set('month', String(params.month))

  const raw = await apiFetch<RawNamuna6ListResponse>(url.toString(), { method: 'GET', ...init })
  return {
    fiscalYear: raw.fiscal_year,
    fyMonthNo: raw.fy_month_no,
    monthLabel: raw.month_label,
    daysInMonth: raw.days_in_month,
    items: raw.items.map((item) => ({
      accountHead: item.account_head,
      dayTotalsPaise: item.day_totals_paise,
      monthTotalPaise: item.month_total_paise,
      fyRunningPaise: item.fy_running_paise,
    })),
  }
}
