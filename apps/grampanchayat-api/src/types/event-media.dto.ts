import { z } from 'zod'
import { EVENT_MEDIA_TYPES } from '../db/schema/event-media.ts'

export const eventMediaTypeSchema = z.enum(EVENT_MEDIA_TYPES)

export const createEventMediaSchema = z.object({
  url: z.string().min(1),
  type: eventMediaTypeSchema,
  caption: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
})

export const updateEventMediaSchema = createEventMediaSchema.partial()

export type CreateEventMedia = z.infer<typeof createEventMediaSchema>
export type UpdateEventMedia = z.infer<typeof updateEventMediaSchema>
