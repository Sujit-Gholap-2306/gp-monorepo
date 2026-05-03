import { z } from 'zod'
import { PIPE_SIZES_INCH, WATER_CONNECTION_STATUSES, WATER_CONNECTION_TYPES } from '../db/schema/water-connections.ts'

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

const optionalIsoDate = z.preprocess(
  (value) => {
    const v = firstValue(value)
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use ISO date YYYY-MM-DD').optional()
)

const pipeSizeInchSchema = z.coerce.number().refine(
  (value) => PIPE_SIZES_INCH.includes(value as (typeof PIPE_SIZES_INCH)[number]),
  `pipeSizeInch must be one of ${PIPE_SIZES_INCH.join(', ')}`
)

export const waterConnectionListQuerySchema = z.object({
  status: z.preprocess(firstValue, z.enum(WATER_CONNECTION_STATUSES).optional()),
  connectionType: z.preprocess(firstValue, z.enum(WATER_CONNECTION_TYPES).optional()),
  citizenNo: z.preprocess(firstValue, z.coerce.number().int().positive().optional()),
  q: optionalString,
})

export const waterConnectionIdParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

export const createWaterConnectionSchema = z.object({
  citizenId: z.string().uuid('citizenId must be a valid UUID'),
  connectionType: z.enum(WATER_CONNECTION_TYPES),
  pipeSizeInch: z.preprocess(firstValue, pipeSizeInchSchema),
  connectedAt: optionalIsoDate,
  notes: optionalString.nullable(),
})

export const updateWaterConnectionSchema = createWaterConnectionSchema
  .omit({ citizenId: true, connectionType: true, pipeSizeInch: true })
  .partial()

export const setWaterConnectionStatusSchema = z.object({
  status: z.enum(WATER_CONNECTION_STATUSES),
})

export type WaterConnectionListQuery = z.infer<typeof waterConnectionListQuerySchema>
export type CreateWaterConnectionBody = z.infer<typeof createWaterConnectionSchema>
export type UpdateWaterConnectionBody = z.infer<typeof updateWaterConnectionSchema>
export type SetWaterConnectionStatusBody = z.infer<typeof setWaterConnectionStatusSchema>
