import { z } from 'zod'

export const namuna10CreateBodySchema = z.object({
  propertyId:  z.string().uuid(),
  payerName:   z.string().trim().min(1).max(200),
  fiscalYear:  z.string().regex(/^\d{4}-\d{2}$/, 'must be YYYY-YY'),
  paidAt:      z.string().datetime(),
  paymentMode: z.enum(['cash', 'upi', 'cheque', 'neft', 'other']),
  reference:   z.string().trim().max(200).optional(),
  lines: z.array(z.object({
    demandLineId: z.string().uuid(),
    amountPaise:  z.number().int().positive(),
  })).min(1),
  discountPaise:  z.number().int().min(0).default(0),
  lateFeePaise:   z.number().int().min(0).default(0),
  noticeFeePaise: z.number().int().min(0).default(0),
  otherPaise:     z.number().int().min(0).default(0),
  otherReason:    z.string().trim().max(500).optional(),
})
  .superRefine((data, ctx) => {
    const seen = new Set<string>()

    for (const [index, line] of data.lines.entries()) {
      if (seen.has(line.demandLineId)) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    ['lines', index, 'demandLineId'],
          message: 'Duplicate demandLineId in receipt lines',
        })
      }
      seen.add(line.demandLineId)
    }
  })

export type Namuna10CreateBody = z.infer<typeof namuna10CreateBodySchema>

export const namuna10IdParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

export const namuna10VoidBodySchema = z.object({
  reason: z.string().trim().min(3, 'Void reason is required').max(500),
})

export type Namuna10IdParams = z.infer<typeof namuna10IdParamsSchema>
export type Namuna10VoidBody = z.infer<typeof namuna10VoidBodySchema>
