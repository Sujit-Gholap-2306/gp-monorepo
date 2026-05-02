import { z } from 'zod'
import { WATER_CONNECTION_RATE_TYPES } from '../db/schema/water-connection-rates.ts'

const firstValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0]
  return value
}

const fiscalYearSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}$/, 'fiscal_year must be in YYYY-YY format')

export const waterConnectionRateRowSchema = z.object({
  fiscal_year: fiscalYearSchema,
  connection_type: z.enum(WATER_CONNECTION_RATE_TYPES),
  pipe_size_mm: z.coerce.number().int().positive('pipe_size_mm must be >= 1'),
  annual_paise: z.coerce.number().int().positive('annual_paise must be >= 1'),
})

export const waterConnectionRatesUpsertBodySchema = z.object({
  rates: z.array(waterConnectionRateRowSchema).min(1, 'At least one rate row is required'),
})

export const waterConnectionRatesListQuerySchema = z.object({
  fiscal_year: z.preprocess(firstValue, fiscalYearSchema.optional()),
  connection_type: z.preprocess(firstValue, z.enum(WATER_CONNECTION_RATE_TYPES).optional()),
})

export type WaterConnectionRateRow = z.infer<typeof waterConnectionRateRowSchema>
export type WaterConnectionRatesListQuery = z.infer<typeof waterConnectionRatesListQuerySchema>
