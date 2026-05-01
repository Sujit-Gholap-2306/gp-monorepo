import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gpNamuna05View, gpNamuna06View } from '../db/schema/index.ts'
import { GP_ACCOUNT_HEADS, type GpAccountHead } from '../lib/account-heads.ts'
import { currentFiscalYear, fyMonthNo } from '../lib/fiscal.ts'
import type { Namuna5ListQuery, Namuna6ListQuery } from '../types/namuna56.dto.ts'

type N05ViewRow = {
  id: string
  gpId: string
  entryDate: string
  fiscalYear: string
  fyMonthNo: number
  entryType: string
  accountHead: string
  description: string | null
  amountPaise: number
  sourceType: string
  sourceId: string | null
  sourceLineId: string | null
  createdBy: string
  runningBalancePaise: number
}

type N06ViewRow = {
  accountHead: string
  dailyTotalsPaise: Record<string, unknown> | null
  monthTotalPaise: number
  fyRunningPaise: number
}

function asNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

function asStringNumberMap(value: Record<string, unknown> | null): Record<string, number> {
  if (!value) return {}
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, raw]) => [key, Number(raw)])
      .filter(([, num]) => Number.isFinite(num))
  )
}

function isAccountHead(value: string): value is GpAccountHead {
  return (GP_ACCOUNT_HEADS as readonly string[]).includes(value)
}

function fyMonthToCalendarMonth(fiscalYear: string, monthNo: number): { year: number; month: number } {
  const startYear = Number(fiscalYear.slice(0, 4))
  const month = ((monthNo + 2) % 12) + 1
  const year = month >= 4 ? startYear : startYear + 1
  return { year, month }
}

function fyMonthLabel(fiscalYear: string, monthNo: number): string {
  const { year, month } = fyMonthToCalendarMonth(fiscalYear, monthNo)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function daysInFyMonth(fiscalYear: string, monthNo: number): number {
  const { year, month } = fyMonthToCalendarMonth(fiscalYear, monthNo)
  return new Date(year, month, 0).getDate()
}

export const namuna56Service = {
  async listNamuna5(gpId: string, query: Namuna5ListQuery) {
    const fiscalYear = query.fiscalYear ?? currentFiscalYear()
    const limit = Math.min(query.limit ?? 300, 1000)

    const conditions = [
      eq(gpNamuna05View.gpId, gpId),
      eq(gpNamuna05View.fiscalYear, fiscalYear),
    ]

    if (query.from) conditions.push(gte(gpNamuna05View.entryDate, query.from))
    if (query.to) conditions.push(lte(gpNamuna05View.entryDate, query.to))
    if (query.head) conditions.push(eq(gpNamuna05View.accountHead, query.head))

    const rows = await db
      .select({
        id:                 gpNamuna05View.id,
        gpId:               gpNamuna05View.gpId,
        entryDate:          gpNamuna05View.entryDate,
        fiscalYear:         gpNamuna05View.fiscalYear,
        fyMonthNo:          gpNamuna05View.fyMonthNo,
        entryType:          gpNamuna05View.entryType,
        accountHead:        gpNamuna05View.accountHead,
        description:        gpNamuna05View.description,
        amountPaise:        gpNamuna05View.amountPaise,
        sourceType:         gpNamuna05View.sourceType,
        sourceId:           gpNamuna05View.sourceId,
        sourceLineId:       gpNamuna05View.sourceLineId,
        createdBy:          gpNamuna05View.createdBy,
        runningBalancePaise: gpNamuna05View.runningBalancePaise,
      })
      .from(gpNamuna05View)
      .where(and(...conditions))
      .orderBy(desc(gpNamuna05View.entryDate), desc(gpNamuna05View.id))
      .limit(limit)

    const [summary] = await db
      .select({
        creditPaise: sql<string>`COALESCE(SUM(CASE WHEN ${gpNamuna05View.entryType} = 'credit' THEN ${gpNamuna05View.amountPaise} ELSE 0 END), 0)::bigint`,
        debitPaise: sql<string>`COALESCE(SUM(CASE WHEN ${gpNamuna05View.entryType} = 'debit' THEN ${gpNamuna05View.amountPaise} ELSE 0 END), 0)::bigint`,
      })
      .from(gpNamuna05View)
      .where(and(...conditions))

    return {
      fiscalYear,
      filters: {
        from: query.from ?? null,
        to: query.to ?? null,
        head: query.head ?? null,
      },
      count: rows.length,
      totals: {
        creditPaise: asNumber(summary?.creditPaise),
        debitPaise: asNumber(summary?.debitPaise),
        netPaise: asNumber(summary?.creditPaise) - asNumber(summary?.debitPaise),
      },
      items: rows.map((row): N05ViewRow => ({
        id:                 row.id,
        gpId:               row.gpId,
        entryDate:          row.entryDate,
        fiscalYear:         row.fiscalYear,
        fyMonthNo:          row.fyMonthNo,
        entryType:          row.entryType,
        accountHead:        row.accountHead,
        description:        row.description,
        amountPaise:        asNumber(row.amountPaise),
        sourceType:         row.sourceType,
        sourceId:           row.sourceId,
        sourceLineId:       row.sourceLineId,
        createdBy:          row.createdBy,
        runningBalancePaise: asNumber(row.runningBalancePaise),
      })),
    }
  },

  async listNamuna6(gpId: string, query: Namuna6ListQuery) {
    const fiscalYear = query.fiscalYear ?? currentFiscalYear()
    const monthNo = query.month ?? fyMonthNo(new Date())

    const rows = await db
      .select({
        accountHead:     gpNamuna06View.accountHead,
        dailyTotalsPaise: gpNamuna06View.dailyTotalsPaise,
        monthTotalPaise: gpNamuna06View.monthTotalPaise,
        fyRunningPaise:  gpNamuna06View.fyRunningPaise,
      })
      .from(gpNamuna06View)
      .where(and(
        eq(gpNamuna06View.gpId, gpId),
        eq(gpNamuna06View.fiscalYear, fiscalYear),
        eq(gpNamuna06View.fyMonthNo, monthNo)
      ))
      .orderBy(asc(gpNamuna06View.accountHead))

    const byHead = new Map(
      rows
        .filter((row) => row.accountHead !== null && isAccountHead(row.accountHead as string))
        .map((row) => [row.accountHead as GpAccountHead, row as unknown as N06ViewRow])
    )

    const days = daysInFyMonth(fiscalYear, monthNo)

    const items = GP_ACCOUNT_HEADS.map((head) => {
      const row = byHead.get(head)
      const dailyTotalsPaise = asStringNumberMap(row?.dailyTotalsPaise ?? null)
      const dayTotals = Array.from({ length: 31 }, (_, i) => {
        const day = i + 1
        if (day > days) return null
        const value = dailyTotalsPaise[String(day)]
        return Number.isFinite(value) ? value : 0
      })
      return {
        accountHead: head,
        dayTotalsPaise: dayTotals,
        monthTotalPaise: asNumber(row?.monthTotalPaise),
        fyRunningPaise: asNumber(row?.fyRunningPaise),
      }
    })

    return {
      fiscalYear,
      fyMonthNo: monthNo,
      monthLabel: fyMonthLabel(fiscalYear, monthNo),
      daysInMonth: days,
      items,
    }
  },
}
