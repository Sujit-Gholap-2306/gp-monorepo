import { z } from 'zod'
import { type TaxHead } from '../lib/tax-head.ts'

export type RowFieldError = { field: string; message: string }
export type RowValidationError = { row: number; message: string; fields?: RowFieldError[] }

export const NAMUNA9_OPENING_TEMPLATE_COLUMNS = [
  {
    key:      'property_no',
    required: true,
    hint:     'Must match existing property_no in this GP.',
  },
  {
    key:      'house_arrears_rupees',
    required: true,
    hint:     'घरपट्टी मागील थकबाकी (₹). Non-negative. Max 2 decimals.',
  },
  {
    key:      'house_demand_rupees',
    required: false,
    hint:     'घरपट्टी चालू मागणी (reference only). Upload ignores this column.',
  },
  {
    key:      'house_total_rupees',
    required: false,
    hint:     'घरपट्टी एकूण (reference only). Upload ignores this column.',
  },
  {
    key:      'lighting_arrears_rupees',
    required: true,
    hint:     'दिवाबत्ती मागील थकबाकी (₹). Non-negative. Max 2 decimals.',
  },
  {
    key:      'lighting_demand_rupees',
    required: false,
    hint:     'दिवाबत्ती चालू मागणी (reference only). Upload ignores this column.',
  },
  {
    key:      'lighting_total_rupees',
    required: false,
    hint:     'दिवाबत्ती एकूण (reference only). Upload ignores this column.',
  },
  {
    key:      'sanitation_arrears_rupees',
    required: true,
    hint:     'स्वच्छता मागील थकबाकी (₹). Non-negative. Max 2 decimals.',
  },
  {
    key:      'sanitation_demand_rupees',
    required: false,
    hint:     'स्वच्छता चालू मागणी (reference only). Upload ignores this column.',
  },
  {
    key:      'sanitation_total_rupees',
    required: false,
    hint:     'स्वच्छता एकूण (reference only). Upload ignores this column.',
  },
  {
    key:      'water_arrears_rupees',
    required: true,
    hint:     'पाणीपट्टी मागील थकबाकी (₹). Non-negative. Max 2 decimals.',
  },
  {
    key:      'water_demand_rupees',
    required: false,
    hint:     'पाणीपट्टी चालू मागणी (reference only). Upload ignores this column.',
  },
  {
    key:      'water_total_rupees',
    required: false,
    hint:     'पाणीपट्टी एकूण (reference only). Upload ignores this column.',
  },
] as const

function parseMoneyCell(value: unknown, field: string): number {
  if (value == null) throw new Error(`${field} is required`)
  const raw = String(value).trim()
  if (!raw) throw new Error(`${field} is required`)
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error(`${field} must be non-negative with max 2 decimals`)
  }
  const n = Number(raw)
  if (!Number.isFinite(n)) {
    throw new Error(`${field} must be a valid number`)
  }
  return n
}

function parseOptionalMoneyCell(value: unknown, field: string): number | null {
  if (value == null) return null
  const raw = String(value).trim()
  if (!raw) return null
  return parseMoneyCell(raw, field)
}

function parseLegacyPaidCell(value: unknown): number | null {
  if (value == null) return null
  const raw = String(value).trim()
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  return n
}

const openingRowSchema = z.object({
  property_no: z.string().trim().min(1, 'property_no is required'),
  house_arrears_rupees: z.custom<number>((v) => {
    try {
      parseMoneyCell(v, 'house_arrears_rupees')
      return true
    } catch {
      return false
    }
  }, { message: 'house_arrears_rupees must be non-negative with max 2 decimals' }),
  lighting_arrears_rupees: z.custom<number>((v) => {
    try {
      parseMoneyCell(v, 'lighting_arrears_rupees')
      return true
    } catch {
      return false
    }
  }, { message: 'lighting_arrears_rupees must be non-negative with max 2 decimals' }),
  sanitation_arrears_rupees: z.custom<number>((v) => {
    try {
      parseMoneyCell(v, 'sanitation_arrears_rupees')
      return true
    } catch {
      return false
    }
  }, { message: 'sanitation_arrears_rupees must be non-negative with max 2 decimals' }),
  water_arrears_rupees: z.custom<number>((v) => {
    try {
      parseMoneyCell(v, 'water_arrears_rupees')
      return true
    } catch {
      return false
    }
  }, { message: 'water_arrears_rupees must be non-negative with max 2 decimals' }),
})

type ArrearsByHead = Record<TaxHead, number>

export type Namuna9OpeningRow = {
  propertyNo: string
  arrearsByHead: ArrearsByHead
}

function emptyArrearsByHead(): ArrearsByHead {
  return {
    house: 0,
    lighting: 0,
    sanitation: 0,
    water: 0,
  }
}

function headArrearsFromRow(row: Record<string, string>): ArrearsByHead {
  const arrears = emptyArrearsByHead()
  arrears.house = parseMoneyCell(row.house_arrears_rupees, 'house_arrears_rupees')
  arrears.lighting = parseMoneyCell(row.lighting_arrears_rupees, 'lighting_arrears_rupees')
  arrears.sanitation = parseMoneyCell(row.sanitation_arrears_rupees, 'sanitation_arrears_rupees')
  arrears.water = parseMoneyCell(row.water_arrears_rupees, 'water_arrears_rupees')
  return arrears
}

function flattenZodIssues(issues: z.ZodIssue[]): RowFieldError[] {
  return issues.map((issue) => ({
    field: issue.path.join('.') || '(row)',
    message: issue.message,
  }))
}

function validateOptionalReferenceColumns(
  row: Record<string, string>,
  fields: string[]
): string[] {
  const out: string[] = []
  for (const field of fields) {
    try {
      parseOptionalMoneyCell(row[field], field)
    } catch (error) {
      out.push(error instanceof Error ? error.message : `${field} is invalid`)
    }
  }
  return out
}

export function collectNamuna9OpeningRowErrors(
  rows: Record<string, string>[]
): { ok: true; data: Namuna9OpeningRow[] } | { ok: false; errors: RowValidationError[] } {
  const out: Namuna9OpeningRow[] = []
  const errors: RowValidationError[] = []
  const seenPropertyNos = new Set<string>()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const rowNo = i + 2
    const legacyPaid = parseLegacyPaidCell(row.current_year_paid_rupees)
    if (legacyPaid != null && legacyPaid !== 0) {
      errors.push({
        row: rowNo,
        message:
          'current_year_paid_rupees is not supported in N09 opening import. Record paid collections via N10 receipt flow.',
      })
      continue
    }

    const parsed = openingRowSchema.safeParse(row)
    if (!parsed.success) {
      errors.push({
        row: rowNo,
        message: 'Validation failed',
        fields: flattenZodIssues(parsed.error.issues),
      })
      continue
    }

    if (seenPropertyNos.has(parsed.data.property_no)) {
      errors.push({
        row: rowNo,
        message: `Duplicate property_no ${parsed.data.property_no}. Keep one row per property.`,
      })
      continue
    }

    const refColumnErrors = validateOptionalReferenceColumns(row, [
      'house_demand_rupees',
      'lighting_demand_rupees',
      'sanitation_demand_rupees',
      'water_demand_rupees',
      'house_total_rupees',
      'lighting_total_rupees',
      'sanitation_total_rupees',
      'water_total_rupees',
    ])
    if (refColumnErrors.length > 0) {
      errors.push({
        row: rowNo,
        message: refColumnErrors.join(' · '),
      })
      continue
    }

    try {
      out.push({
        propertyNo: parsed.data.property_no,
        arrearsByHead: headArrearsFromRow(row),
      })
      seenPropertyNos.add(parsed.data.property_no)
    } catch (error) {
      errors.push({
        row: rowNo,
        message: error instanceof Error ? error.message : 'Invalid numeric value',
      })
    }
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: out }
}
