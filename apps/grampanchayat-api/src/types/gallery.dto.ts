import { z } from 'zod'
import { GALLERY_MEDIA_TYPES } from '../db/schema/gallery.ts'

export const galleryMediaTypeSchema = z.enum(GALLERY_MEDIA_TYPES)

export const createGalleryItemSchema = z.object({
  url: z.string().min(1),
  type: galleryMediaTypeSchema,
  captionMr: z.string().optional().nullable(),
  captionEn: z.string().optional().nullable(),
  takenAt: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
})

export const updateGalleryItemSchema = createGalleryItemSchema.partial()

export type CreateGalleryItem = z.infer<typeof createGalleryItemSchema>
export type UpdateGalleryItem = z.infer<typeof updateGalleryItemSchema>
