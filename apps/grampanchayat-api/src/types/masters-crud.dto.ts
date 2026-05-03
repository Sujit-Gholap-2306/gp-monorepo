import { z } from 'zod'
import { PROPERTY_TYPES, AGE_BRACKETS } from './masters-bulk.dto.ts'

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
  z.string().trim().min(1).optional()
)

// For PATCH: empty string → null so nullable columns can be cleared.
// undefined (field absent) → Drizzle skips. null → Drizzle writes NULL.
const clearableTrimmedString = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (v == null || (typeof v === 'string' && v.trim() === '')) return null
    return v
  },
  z.string().trim().min(1).nullable().optional()
)

const optionalDigits4 = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits').optional()
)

const clearableDigits4 = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (v == null || (typeof v === 'string' && v.trim() === '')) return null
    return v
  },
  z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits').nullable().optional()
)

const optionalIsoDate = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use ISO date YYYY-MM-DD').optional()
)

const optionalNonNegativeNumber = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (v === '' || v == null) return undefined
    return v
  },
  z.coerce.number().nonnegative().optional()
)

const optionalNonNegativePaise = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (v === '' || v == null) return undefined
    return v
  },
  z.coerce.number().int().nonnegative().optional()
)

export const masterRecordIdParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

export const citizenListQuerySchema = z.object({
  q: optionalTrimmedString,
  ward: optionalTrimmedString,
})

export const createCitizenSchema = z.object({
  name_mr: z.string().trim().min(2, 'name_mr is required'),
  name_en: optionalTrimmedString,
  mobile: z.string().trim().regex(/^\d{10}$/, 'mobile must be 10 digits'),
  ward_number: z.string().trim().min(1, 'ward_number is required'),
  address_mr: z.string().trim().min(2, 'address_mr is required'),
  aadhaar_last4: optionalDigits4,
  household_id: optionalTrimmedString,
})

export const updateCitizenSchema = createCitizenSchema.partial().extend({
  name_en: clearableTrimmedString,
  aadhaar_last4: clearableDigits4,
  household_id: clearableTrimmedString,
})

export const propertyListQuerySchema = z.object({
  q: optionalTrimmedString,
  ward: optionalTrimmedString,
  property_type: z.preprocess(firstValue, z.enum(PROPERTY_TYPES).optional()),
})

export const createPropertySchema = z.object({
  owner_citizen_id: z.string().uuid('owner_citizen_id must be a valid UUID'),
  property_type: z.enum(PROPERTY_TYPES),
  length_ft: optionalNonNegativeNumber,
  width_ft: optionalNonNegativeNumber,
  occupant_name: z.string().trim().min(1, 'occupant_name is required'),
  survey_number: optionalTrimmedString,
  plot_or_gat: optionalTrimmedString,
  age_bracket: z.preprocess(
    (value) => {
      const v = firstValue(value)
      if (typeof v === 'string' && v.trim() === '') return undefined
      return v
    },
    z.enum(AGE_BRACKETS).optional()
  ),
  resolution_ref: optionalTrimmedString,
  assessment_date: optionalIsoDate,
  lighting_tax_paise: optionalNonNegativePaise,
  sanitation_tax_paise: optionalNonNegativePaise,
})

export const updatePropertySchema = createPropertySchema.omit({ owner_citizen_id: true }).partial().extend({
  survey_number: clearableTrimmedString,
  plot_or_gat: clearableTrimmedString,
  resolution_ref: clearableTrimmedString,
  assessment_date: z.preprocess(
    (value) => {
      const v = firstValue(value)
      if (v == null || (typeof v === 'string' && v.trim() === '')) return null
      return v
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use ISO date YYYY-MM-DD').nullable().optional()
  ),
  lighting_tax_paise: z.preprocess(
    (value) => {
      const v = firstValue(value)
      if (v === '' || v == null) return null
      return v
    },
    z.coerce.number().int().nonnegative().nullable().optional()
  ),
  sanitation_tax_paise: z.preprocess(
    (value) => {
      const v = firstValue(value)
      if (v === '' || v == null) return null
      return v
    },
    z.coerce.number().int().nonnegative().nullable().optional()
  ),
})

export type CitizenListQuery = z.infer<typeof citizenListQuerySchema>
export type CreateCitizenBody = z.infer<typeof createCitizenSchema>
export type UpdateCitizenBody = z.infer<typeof updateCitizenSchema>
export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>
export type CreatePropertyBody = z.infer<typeof createPropertySchema>
export type UpdatePropertyBody = z.infer<typeof updatePropertySchema>
