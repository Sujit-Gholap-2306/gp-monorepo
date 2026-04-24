import { z } from 'zod'

export const createEventSchema = z.object({
  titleMr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionMr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  eventDate: z.string().min(1),
  locationMr: z.string().optional().nullable(),
  locationEn: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEvent = z.infer<typeof createEventSchema>
export type UpdateEvent = z.infer<typeof updateEventSchema>
