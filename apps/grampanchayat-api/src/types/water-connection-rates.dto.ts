import { z } from 'zod'
import { PIPE_SIZES_INCH } from '../db/schema/water-connections.ts'
import { WATER_CONNECTION_RATE_TYPES } from '../db/schema/water-connection-rates.ts'
import { fiscalYearZodSchema } from '../lib/fiscal.ts'

const firstValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0]
  return value
}

const fiscalYearSchema = fiscalYearZodSchema
const pipeSizeInchSchema = z.coerce.number().refine(
  (value) => PIPE_SIZES_INCH.includes(value as (typeof PIPE_SIZES_INCH)[number]),
  `pipe_size_inch must be one of ${PIPE_SIZES_INCH.join(', ')}`
)

export const waterConnectionRateRowSchema = z.object({
  fiscal_year: fiscalYearSchema,
  connection_type: z.enum(WATER_CONNECTION_RATE_TYPES),
  pipe_size_inch: z.preprocess(firstValue, pipeSizeInchSchema),
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
