import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import { gpWaterConnectionRates } from '../db/schema/index.ts'
import type { WaterConnectionRateRow, WaterConnectionRatesListQuery } from '../types/water-connection-rates.dto.ts'

export const waterConnectionRatesService = {
  async listForGp(gpId: string, filters: WaterConnectionRatesListQuery) {
    const conditions = [eq(gpWaterConnectionRates.gpId, gpId)]

    if (filters.fiscal_year) {
      conditions.push(eq(gpWaterConnectionRates.fiscalYear, filters.fiscal_year))
    }
    if (filters.connection_type) {
      conditions.push(eq(gpWaterConnectionRates.connectionType, filters.connection_type))
    }

    const items = await db
      .select()
      .from(gpWaterConnectionRates)
      .where(and(...conditions))
      .orderBy(
        asc(gpWaterConnectionRates.fiscalYear),
        asc(gpWaterConnectionRates.connectionType),
        asc(gpWaterConnectionRates.pipeSizeMm)
      )

    return { items, count: items.length }
  },

  async upsertForGp(gpId: string, rows: WaterConnectionRateRow[]) {
    const keys = rows.map((r) => `${r.fiscal_year}::${r.connection_type}::${String(r.pipe_size_mm)}`)
    const seen = new Set(keys)
    if (seen.size !== keys.length) {
      throw new ApiError(422, 'Duplicate (fiscal_year, connection_type, pipe_size_mm) entries in request')
    }

    const values = rows.map((r) => ({
      gpId,
      fiscalYear: r.fiscal_year,
      connectionType: r.connection_type,
      pipeSizeMm: r.pipe_size_mm,
      annualPaise: r.annual_paise,
    }))

    await db
      .insert(gpWaterConnectionRates)
      .values(values)
      .onConflictDoUpdate({
        target: [
          gpWaterConnectionRates.gpId,
          gpWaterConnectionRates.fiscalYear,
          gpWaterConnectionRates.connectionType,
          gpWaterConnectionRates.pipeSizeMm,
        ],
        set: {
          annualPaise: sql`excluded.annual_paise`,
          updatedAt: sql`now()`,
        },
      })

    const fiscalYears = [...new Set(rows.map((r) => r.fiscal_year))]
    return this.listForGp(gpId, {
      fiscal_year: fiscalYears.length === 1 ? fiscalYears[0] : undefined,
    })
  },
}
