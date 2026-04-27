import { z } from 'zod'
import { parseFiscalYear } from '../lib/fiscal.ts'

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
  z.string().trim().optional()
)

export const namuna9GenerateBodySchema = z.object({
  fiscalYear: optionalFiscalYear,
})
  .superRefine((data, ctx) => {
    if (!data.fiscalYear) return
    try {
      parseFiscalYear(data.fiscalYear)
    } catch {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['fiscalYear'],
        message: 'fiscalYear must be in YYYY-YY format',
      })
    }
  })

const optionalString = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().trim().min(1).optional()
)

export const namuna9StatusSchema = z.enum(['pending', 'partial', 'paid'])

const optionalPositiveInt = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (v == null || (typeof v === 'string' && v.trim() === '')) return undefined
    const n = Number(v)
    return Number.isInteger(n) ? n : undefined
  },
  z.number().int().positive().optional()
)

export const namuna9ListQuerySchema = z.object({
  fiscalYear: optionalFiscalYear,
  ward:       optionalString,
  q:          optionalString,
  propertyId: z.preprocess(
    (value) => {
      const v = firstValue(value)
      if (typeof v === 'string' && v.trim() === '') return undefined
      return v
    },
    z.string().uuid().optional()
  ),
  status:     z.preprocess(firstValue, namuna9StatusSchema.optional()),
  citizenNo:  optionalPositiveInt,
})
  .superRefine((data, ctx) => {
    if (!data.fiscalYear) return
    try {
      parseFiscalYear(data.fiscalYear)
    } catch {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['fiscalYear'],
        message: 'fiscalYear must be in YYYY-YY format',
      })
    }
  })

export const namuna9DemandParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

export type Namuna9GenerateBody = z.infer<typeof namuna9GenerateBodySchema>
export type Namuna9ListQuery = z.infer<typeof namuna9ListQuerySchema>
export type Namuna9Status = z.infer<typeof namuna9StatusSchema>
export type Namuna9CitizenListQuery = z.infer<typeof namuna9ListQuerySchema>
