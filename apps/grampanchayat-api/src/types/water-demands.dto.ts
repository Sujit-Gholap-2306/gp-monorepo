import { z } from 'zod'

const firstValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0]
  return value
}

const optionalFiscalYear = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().trim().regex(/^\d{4}-\d{2}$/, 'fiscal_year must be in YYYY-YY format').optional()
)

const optionalString = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().trim().min(1).optional()
)

const optionalStatus = z.preprocess(
  firstValue,
  z.enum(['pending', 'partial', 'paid']).optional()
)

export const waterDemandListQuerySchema = z.object({
  fiscal_year: optionalFiscalYear,
  status: optionalStatus,
  q: optionalString,
  ward: optionalString,
  citizen_no: z.preprocess(firstValue, z.coerce.number().int().positive().optional()),
})

export const waterDemandGenerateBodySchema = z.object({
  fiscal_year: optionalFiscalYear,
})

export const waterDemandRateMasterStatusQuerySchema = z.object({
  fiscal_year: optionalFiscalYear,
})

export type WaterDemandListQuery = z.infer<typeof waterDemandListQuerySchema>
export type WaterDemandGenerateBody = z.infer<typeof waterDemandGenerateBodySchema>
export type WaterDemandRateMasterStatusQuery = z.infer<typeof waterDemandRateMasterStatusQuerySchema>
