import { z } from 'zod'
import { NAMUNA10_BOOK_TYPES } from '../db/schema/namuna10-receipts.ts'

const lineSchema = z.object({
  demandLineId: z.string().uuid().optional(),
  waterDemandLineId: z.string().uuid().optional(),
  amountPaise: z.number().int().positive(),
}).refine(
  (l) => Boolean(l.demandLineId) !== Boolean(l.waterDemandLineId),
  { message: 'Exactly one of demandLineId or waterDemandLineId must be set' }
)

export const namuna10CreateBodySchema = z.object({
  bookType: z.enum(NAMUNA10_BOOK_TYPES).default('property'),
  propertyId: z.string().uuid().optional(),
  waterConnectionId: z.string().uuid().optional(),
  payerName:   z.string().trim().min(1).max(200),
  fiscalYear:  z.string().regex(/^\d{4}-\d{2}$/, 'must be YYYY-YY'),
  paidAt:      z.string().datetime(),
  paymentMode: z.enum(['cash', 'upi', 'cheque', 'neft', 'other']),
  reference:   z.string().trim().max(200).optional(),
  lines: z.array(lineSchema).min(1),
  discountPaise:  z.number().int().min(0).default(0),
  lateFeePaise:   z.number().int().min(0).default(0),
  noticeFeePaise: z.number().int().min(0).default(0),
  otherPaise:     z.number().int().min(0).default(0),
  otherReason:    z.string().trim().max(500).optional(),
})
  .superRefine((data, ctx) => {
    const seen = new Set<string>()

    if (data.bookType === 'property') {
      if (!data.propertyId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['propertyId'],
          message: 'propertyId is required for property book',
        })
      }
      if (data.waterConnectionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['waterConnectionId'],
          message: 'waterConnectionId is not allowed for property book',
        })
      }
    }

    if (data.bookType === 'water') {
      if (!data.waterConnectionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['waterConnectionId'],
          message: 'waterConnectionId is required for water book',
        })
      }
      if (data.propertyId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['propertyId'],
          message: 'propertyId is not allowed for water book',
        })
      }
      if (data.lines.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lines'],
          message: 'Water book receipt must contain exactly one line',
        })
      }
    }

    for (const [index, line] of data.lines.entries()) {
      if (data.bookType === 'property') {
        if (!line.demandLineId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lines', index, 'demandLineId'],
            message: 'demandLineId is required for property book',
          })
          continue
        }
        if (line.waterDemandLineId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lines', index, 'waterDemandLineId'],
            message: 'waterDemandLineId is not allowed for property book',
          })
        }
      }

      if (data.bookType === 'water') {
        if (!line.waterDemandLineId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lines', index, 'waterDemandLineId'],
            message: 'waterDemandLineId is required for water book',
          })
          continue
        }
        if (line.demandLineId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lines', index, 'demandLineId'],
            message: 'demandLineId is not allowed for water book',
          })
        }
      }

      const lineTargetId = line.demandLineId ?? line.waterDemandLineId
      if (!lineTargetId) continue
      if (seen.has(lineTargetId)) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    ['lines', index],
          message: 'Duplicate demand line id in receipt lines',
        })
      }
      seen.add(lineTargetId)
    }
  })

export type Namuna10CreateBody = z.infer<typeof namuna10CreateBodySchema>

const optionalUuid = z.string().uuid().optional()

export const namuna10ListQuerySchema = z.object({
  q:                  z.string().trim().min(1).optional(),
  fiscal_year:        z.string().regex(/^\d{4}-\d{2}$/).optional(),
  property_id:        optionalUuid,
  water_connection_id: optionalUuid,
  book_type:          z.enum(NAMUNA10_BOOK_TYPES).optional(),
  limit:              z.coerce.number().int().positive().optional(),
  offset:             z.coerce.number().int().min(0).optional(),
})

export type Namuna10ListQuery = z.infer<typeof namuna10ListQuerySchema>

export const namuna10IdParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

export const namuna10VoidBodySchema = z.object({
  reason: z.string().trim().min(3, 'Void reason is required').max(500),
})

export type Namuna10IdParams = z.infer<typeof namuna10IdParamsSchema>
export type Namuna10VoidBody = z.infer<typeof namuna10VoidBodySchema>
