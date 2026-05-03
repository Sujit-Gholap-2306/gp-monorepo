import { z } from 'zod'
import { PIPE_SIZES_INCH, WATER_CONNECTION_TYPES as CONNECTION_TYPES } from '../db/schema/water-connections.ts'

export type RowFieldError = { field: string; message: string }
export type RowValidationError = { row: number; message: string; fields?: RowFieldError[] }

const firstValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0]
  return value
}

const pipeSizeInchSchema = z.coerce.number().refine(
  (value) => PIPE_SIZES_INCH.includes(value as (typeof PIPE_SIZES_INCH)[number]),
  `pipe_size_inch must be one of ${PIPE_SIZES_INCH.join(', ')}`
)

export const WATER_DEMAND_ARREARS_TEMPLATE_COLUMNS = [
  {
    key: 'consumer_no',
    required: true,
    hint: 'Must match existing water connection consumer_no in this GP.',
  },
  {
    key: 'citizen_no',
    required: true,
    hint: 'Reference check only. Must match the consumer connection.',
  },
  {
    key: 'citizen_name',
    required: true,
    hint: 'Reference check only. Must match citizen name (Marathi or English).',
  },
  {
    key: 'connection_type',
    required: true,
    hint: "Reference check only. One of: 'regular' | 'specialized'.",
  },
  {
    key: 'pipe_size_inch',
    required: true,
    hint: 'Reference check only. One of 1.0, 1.5, 2.0, 2.5.',
  },
  {
    key: 'current_paise',
    required: false,
    hint: 'Reference only. Upload ignores this value.',
  },
  {
    key: 'previous_paise',
    required: true,
    hint: 'Editable/imported value. Non-negative integer paise.',
  },
  {
    key: 'total_paise',
    required: false,
    hint: 'Reference only. Upload ignores this value.',
  },
] as const

const openingRowSchema = z.object({
  consumer_no: z.string().trim().min(1, 'consumer_no is required'),
  citizen_no: z.coerce.number().int().positive('citizen_no must be a positive integer'),
  citizen_name: z.string().trim().min(1, 'citizen_name is required'),
  connection_type: z.enum(CONNECTION_TYPES),
  pipe_size_inch: z.preprocess(firstValue, pipeSizeInchSchema),
  previous_paise: z.preprocess(
    (v) => (v == null || String(v).trim() === '' ? undefined : v),
    z.coerce.number().int().min(0, 'previous_paise must be >= 0')
  ),
  current_paise: z.preprocess(
    (v) => (v == null || String(v).trim() === '' ? undefined : v),
    z.coerce.number().int().min(0, 'current_paise must be >= 0').optional()
  ),
  total_paise: z.preprocess(
    (v) => (v == null || String(v).trim() === '' ? undefined : v),
    z.coerce.number().int().min(0, 'total_paise must be >= 0').optional()
  ),
})

export type WaterDemandArrearsRow = {
  consumerNo: string
  citizenNo: number
  citizenName: string
  connectionType: (typeof CONNECTION_TYPES)[number]
  pipeSizeInch: number
  previousPaise: number
}

function flattenZodIssues(issues: z.ZodIssue[]): RowFieldError[] {
  return issues.map((issue) => ({
    field: issue.path.join('.') || '(row)',
    message: issue.message,
  }))
}

export function collectWaterDemandArrearsRowErrors(
  rows: Record<string, string>[]
): { ok: true; data: WaterDemandArrearsRow[] } | { ok: false; errors: RowValidationError[] } {
  const out: WaterDemandArrearsRow[] = []
  const errors: RowValidationError[] = []
  const seenConsumerNos = new Set<string>()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const rowNo = i + 2
    const parsed = openingRowSchema.safeParse(row)
    if (!parsed.success) {
      errors.push({
        row: rowNo,
        message: 'Validation failed',
        fields: flattenZodIssues(parsed.error.issues),
      })
      continue
    }

    if (seenConsumerNos.has(parsed.data.consumer_no)) {
      errors.push({
        row: rowNo,
        message: `Duplicate consumer_no ${parsed.data.consumer_no}. Keep one row per connection.`,
      })
      continue
    }

    out.push({
      consumerNo: parsed.data.consumer_no,
      citizenNo: parsed.data.citizen_no,
      citizenName: parsed.data.citizen_name,
      connectionType: parsed.data.connection_type,
      pipeSizeInch: parsed.data.pipe_size_inch,
      previousPaise: parsed.data.previous_paise,
    })
    seenConsumerNos.add(parsed.data.consumer_no)
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: out }
}
