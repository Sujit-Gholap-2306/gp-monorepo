import { z } from 'zod'
import { PROPERTY_TYPE_KEYS } from '../db/schema/property-type-rates.ts'

const firstValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0]
  return value
}

const optionalString = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().trim().min(1).optional()
)

export const namuna8ListQuerySchema = z.object({
  ward:         optionalString,
  q:            optionalString,
  propertyType: z.preprocess(firstValue, z.enum(PROPERTY_TYPE_KEYS).optional()),
})

export const namuna8PropertyParamsSchema = z.object({
  propertyId: z.string().uuid('propertyId must be a valid UUID'),
})

export type Namuna8ListQuery = z.infer<typeof namuna8ListQuerySchema>
