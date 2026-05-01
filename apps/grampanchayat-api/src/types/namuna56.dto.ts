import { z } from 'zod'
import { GP_ACCOUNT_HEADS } from '../lib/account-heads.ts'
import { parseFiscalYear } from '../lib/fiscal.ts'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const firstValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0]
  return value
}

const optionalTrimmedString = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().trim().optional()
)

const optionalFiscalYear = optionalTrimmedString
const optionalDateString = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().regex(DATE_REGEX, 'date must be YYYY-MM-DD').optional()
)

const optionalPositiveInt = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (v == null || (typeof v === 'string' && v.trim() === '')) return undefined
    const n = Number(v)
    return Number.isInteger(n) ? n : undefined
  },
  z.number().int().positive().optional()
)

export const namuna5ListQuerySchema = z.object({
  fiscalYear: optionalFiscalYear,
  from:       optionalDateString,
  to:         optionalDateString,
  head:       z.preprocess(
    firstValue,
    z.enum(GP_ACCOUNT_HEADS).optional()
  ),
  limit: optionalPositiveInt,
})
  .superRefine((data, ctx) => {
    if (data.fiscalYear) {
      try {
        parseFiscalYear(data.fiscalYear)
      } catch {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    ['fiscalYear'],
          message: 'fiscalYear must be in YYYY-YY format',
        })
      }
    }
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['from'],
        message: '`from` cannot be after `to`',
      })
    }
  })

export const namuna6ListQuerySchema = z.object({
  fiscalYear: optionalFiscalYear,
  month: z.preprocess(
    (value) => {
      const v = firstValue(value)
      if (v == null || (typeof v === 'string' && v.trim() === '')) return undefined
      const n = Number(v)
      return Number.isInteger(n) ? n : undefined
    },
    z.number().int().min(1).max(12).optional()
  ),
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

export type Namuna5ListQuery = z.infer<typeof namuna5ListQuerySchema>
export type Namuna6ListQuery = z.infer<typeof namuna6ListQuerySchema>
