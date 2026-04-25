import { z } from 'zod'
import { propertyTypeRateRowSchema } from '../services/property-type-rates.service.ts'

/** Aligns with apps/grampanchayat PropertyType */
export const PROPERTY_TYPES = [
  'jhopdi_mati',
  'dagad_vit_mati',
  'dagad_vit_pucca',
  'navi_rcc',
  'bakhal',
] as const

/** Aligns with apps/grampanchayat AgeBracket */
export const AGE_BRACKETS = [
  '0-2',
  '2-5',
  '5-10',
  '10-20',
  '20-30',
  '30-40',
  '40-50',
  '50-60',
  '60+',
] as const

const ptList = [...PROPERTY_TYPES].join(', ')
const abList = [...AGE_BRACKETS].join(', ')

function emptyToUndef<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (v) => (v === '' || v == null || (typeof v === 'string' && v.trim() === '') ? undefined : v),
    schema
  )
}

/** Positive int from sheet string/number; empty cell → undefined (use on required fields with .refine) */
function requiredPositiveInt(field: string) {
  return z.preprocess((v) => {
    if (v === '' || v == null) return undefined
    if (typeof v === 'string' && v.trim() === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : v
  }, z.number({ invalid_type_error: `${field} must be a number` }).int(`${field} must be a whole number`).positive(`${field} must be >= 1`))
}

export type ImportFieldDef = {
  key: string
  required: boolean
  hint: string
  zod: z.ZodTypeAny
}

function zObjectFromFieldDefs(defs: readonly ImportFieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of defs) {
    shape[f.key] = f.zod
  }
  return z.object(shape)
}

/**
 * Single source: column order, template hints, and Zod validation for citizens bulk import.
 * Template download, GET template-meta, and POST /bulk all derive from this.
 */
export const CITIZEN_IMPORT_FIELDS: readonly ImportFieldDef[] = [
  {
    key:      'citizen_no',
    required: true,
    hint:     'Per-GP serial: 1, 2, 3, … — same value as owner_citizen_no in properties file for that person.',
    zod:      requiredPositiveInt('citizen_no'),
  },
  {
    key:      'name_mr',
    required: true,
    hint:     'Owner name (Marathi).',
    zod:      z.string().min(1, 'name_mr is required'),
  },
  {
    key:      'name_en',
    required: false,
    hint:     'English name; optional.',
    zod:      emptyToUndef(z.string()).optional(),
  },
  {
    key:      'mobile',
    required: true,
    hint:     'Contact number (text as stored in office).',
    zod:      z.string().min(1, 'mobile is required'),
  },
  {
    key:      'ward_number',
    required: true,
    hint:     'Ward / prabhag.',
    zod:      z.string().min(1, 'ward_number is required'),
  },
  {
    key:      'address_mr',
    required: true,
    hint:     'Address (Marathi).',
    zod:      z.string().min(1, 'address_mr is required'),
  },
  {
    key:      'aadhaar_last4',
    required: false,
    hint:     'Last 4 digits only; optional.',
    zod:      emptyToUndef(z.string().max(4)).optional(),
  },
  {
    key:      'household_id',
    required: false,
    hint:     'Optional household grouping id.',
    zod:      emptyToUndef(z.string()).optional(),
  },
]

/**
 * Single source: column order, template hints, and Zod validation for properties bulk import.
 */
export const PROPERTY_IMPORT_FIELDS: readonly ImportFieldDef[] = [
  {
    key:      'owner_citizen_no',
    required: true,
    hint:     'Must match citizen_no from citizens file for this GP (same owner = same number on every property row).',
    zod:      requiredPositiveInt('owner_citizen_no'),
  },
  {
    key:      'property_no',
    required: true,
    hint:     'मालमत्ता क्रमांक; unique per GP.',
    zod:      z.string().min(1, 'property_no is required'),
  },
  {
    key:      'survey_number',
    required: false,
    hint:     'Survey / गट',
    zod:      emptyToUndef(z.string()).optional(),
  },
  {
    key:      'plot_or_gat',
    required: false,
    hint:     'Plot or gat if applicable.',
    zod:      emptyToUndef(z.string()).optional(),
  },
  {
    key:      'property_type',
    required: true,
    hint:     `One of: ${ptList}`,
    zod:      z.enum(PROPERTY_TYPES),
  },
  {
    key:      'length_ft',
    required: false,
    hint:     'Length in feet (number ≥ 0).',
    zod:      emptyToUndef(z.coerce.number().nonnegative()).optional(),
  },
  {
    key:      'width_ft',
    required: false,
    hint:     'Width in feet (number ≥ 0).',
    zod:      emptyToUndef(z.coerce.number().nonnegative()).optional(),
  },
  {
    key:      'age_bracket',
    required: false,
    hint:     `One of: ${abList}`,
    zod:      emptyToUndef(z.enum(AGE_BRACKETS)).optional(),
  },
  {
    key:      'occupant_name',
    required: true,
    hint:     'भोगवटदार',
    zod:      z.string().min(1, 'occupant_name is required'),
  },
  {
    key:      'resolution_ref',
    required: false,
    hint:     'GP resolution reference; optional in demo.',
    zod:      emptyToUndef(z.string()).optional(),
  },
  {
    key:      'assessment_date',
    required: false,
    hint:     'ISO date YYYY-MM-DD only, if set.',
    zod:      emptyToUndef(
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use ISO date YYYY-MM-DD')
    ).optional(),
  },
  {
    key:      'lighting_tax_paise',
    required: false,
    hint:     'Override (paise) for lighting tax. Empty = use property-type default.',
    zod:      emptyToUndef(z.coerce.number().int().nonnegative()).optional(),
  },
  {
    key:      'sanitation_tax_paise',
    required: false,
    hint:     'Override (paise) for sanitation tax. Empty = use property-type default.',
    zod:      emptyToUndef(z.coerce.number().int().nonnegative()).optional(),
  },
  {
    key:      'water_tax_paise',
    required: false,
    hint:     'Override (paise) for water tax. Empty = use property-type default.',
    zod:      emptyToUndef(z.coerce.number().int().nonnegative()).optional(),
  },
]

export const CITIZENS_TEMPLATE_COLUMNS = CITIZEN_IMPORT_FIELDS.map(({ key, required, hint }) => ({
  key,
  required,
  hint,
}))

export const PROPERTIES_TEMPLATE_COLUMNS = PROPERTY_IMPORT_FIELDS.map(({ key, required, hint }) => ({
  key,
  required,
  hint,
}))

const ptRateList = [...PROPERTY_TYPES].join(', ')

/**
 * One row per property type (max 5 per GP, unique property_type) — same shape as propertyTypeRateRowSchema.
 */
export const PROPERTY_TYPE_RATES_IMPORT_FIELDS: readonly ImportFieldDef[] = [
  {
    key:      'property_type',
    required: true,
    hint:     `One of: ${ptRateList} — one row per type in this file, no duplicate types.`,
    zod:      z.enum(PROPERTY_TYPES),
  },
  {
    key:      'min_rate',
    required: false,
    hint:     'किमान दर (संख्या ≥ 0); रिकामे = नोंद नाही.',
    zod:      z.unknown(),
  },
  {
    key:      'max_rate',
    required: false,
    hint:     'कमाल दर (संख्या ≥ 0).',
    zod:      z.unknown(),
  },
  {
    key:      'land_rate_per_sqft',
    required: false,
    hint:     'चौ. ft दर: जमीन.',
    zod:      z.unknown(),
  },
  {
    key:      'construction_rate_per_sqft',
    required: false,
    hint:     'चौ. ft दर: बांधकाम (जुने).',
    zod:      z.unknown(),
  },
  {
    key:      'new_construction_rate_per_sqft',
    required: false,
    hint:     'चौ. ft दर: नवीन बांधकाम.',
    zod:      z.unknown(),
  },
  {
    key:      'default_lighting_paise',
    required: false,
    hint:     'Default lighting tax in paise for this property type.',
    zod:      z.unknown(),
  },
  {
    key:      'default_sanitation_paise',
    required: false,
    hint:     'Default sanitation tax in paise for this property type.',
    zod:      z.unknown(),
  },
  {
    key:      'default_water_paise',
    required: false,
    hint:     'Default water tax in paise for this property type.',
    zod:      z.unknown(),
  },
]

export const PROPERTY_TYPE_RATES_TEMPLATE_COLUMNS = PROPERTY_TYPE_RATES_IMPORT_FIELDS.map(({ key, required, hint }) => ({
  key,
  required,
  hint,
}))

export const citizenRowSchema = zObjectFromFieldDefs(CITIZEN_IMPORT_FIELDS)
export const propertyRowSchema = zObjectFromFieldDefs(PROPERTY_IMPORT_FIELDS)

export type CitizenRow = z.infer<typeof citizenRowSchema>
export type PropertyRow = z.infer<typeof propertyRowSchema>

export type RowFieldError = { field: string; message: string }
export type RowValidationError = { row: number; message: string; fields?: RowFieldError[] }

function flattenZodIssues(issues: z.ZodIssue[]): RowFieldError[] {
  return issues.map((issue) => ({
    field:   issue.path.join('.') || '(row)',
    message: issue.message,
  }))
}

export function collectCitizenRowErrors(
  rows: Record<string, string>[]
): { ok: true; data: CitizenRow[] } | { ok: false; errors: RowValidationError[] } {
  const data: CitizenRow[] = []
  const errors: RowValidationError[] = []
  for (let i = 0; i < rows.length; i++) {
    const parsed = citizenRowSchema.safeParse(rows[i])
    if (parsed.success) {
      data.push(parsed.data)
    } else {
      errors.push({
        row:     i + 2,
        message: 'Validation failed',
        fields:  flattenZodIssues(parsed.error.issues),
      })
    }
  }
  if (errors.length > 0) return { ok: false, errors }
  const seen = new Map<number, number>()
  for (let i = 0; i < data.length; i++) {
    const k = data[i]!.citizen_no
    if (seen.has(k)) {
      return {
        ok:     false,
        errors: [
          {
            row:     i + 2,
            message: `Duplicate citizen_no in file: ${String(k)} (first seen at row ${String(seen.get(k) ?? 0)})`,
          },
        ],
      }
    }
    seen.set(k, i + 2)
  }
  return { ok: true, data }
}

export function collectPropertyRowErrors(
  rows: Record<string, string>[]
): { ok: true; data: PropertyRow[] } | { ok: false; errors: RowValidationError[] } {
  const data: PropertyRow[] = []
  const errors: RowValidationError[] = []
  for (let i = 0; i < rows.length; i++) {
    const parsed = propertyRowSchema.safeParse(rows[i])
    if (parsed.success) {
      data.push(parsed.data)
    } else {
      errors.push({
        row:     i + 2,
        message: 'Validation failed',
        fields:  flattenZodIssues(parsed.error.issues),
      })
    }
  }
  if (errors.length > 0) return { ok: false, errors }
  const seen = new Map<string, number>()
  for (let i = 0; i < data.length; i++) {
    const k = data[i]!.property_no
    if (seen.has(k)) {
      return {
        ok:     false,
        errors: [
          { row: i + 2, message: `Duplicate property_no in file: "${k}" (first seen at row ${String(seen.get(k) ?? 0)})` },
        ],
      }
    }
    seen.set(k, i + 2)
  }
  return { ok: true, data }
}

export function collectPropertyTypeRateRowErrors(
  rows: Record<string, string>[]
): { ok: true; data: z.infer<typeof propertyTypeRateRowSchema>[] } | { ok: false; errors: RowValidationError[] } {
  const data: z.infer<typeof propertyTypeRateRowSchema>[] = []
  const errors: RowValidationError[] = []
  for (let i = 0; i < rows.length; i++) {
    const parsed = propertyTypeRateRowSchema.safeParse(rows[i])
    if (parsed.success) {
      data.push(parsed.data)
    } else {
      errors.push({
        row:     i + 2,
        message: 'Validation failed',
        fields:  flattenZodIssues(parsed.error.issues),
      })
    }
  }
  if (errors.length > 0) return { ok: false, errors }
  const seen = new Map<string, number>()
  for (let i = 0; i < data.length; i++) {
    const k = data[i]!.property_type
    if (seen.has(k)) {
      return {
        ok:     false,
        errors: [
          {
            row:     i + 2,
            message: `Duplicate property_type in file: "${k}" (first at row ${String(seen.get(k) ?? 0)})`,
          },
        ],
      }
    }
    seen.set(k, i + 2)
  }
  return { ok: true, data }
}
