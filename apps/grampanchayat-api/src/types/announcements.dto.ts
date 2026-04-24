import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  titleMr: z.string().min(1),
  titleEn: z.string().min(1),
  contentMr: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  category: z.string().min(1).default('general'),
  docUrl: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export type CreateAnnouncement = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncement = z.infer<typeof updateAnnouncementSchema>
