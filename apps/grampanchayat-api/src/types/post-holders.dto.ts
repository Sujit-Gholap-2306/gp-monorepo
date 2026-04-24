import { z } from 'zod'

export const createPostHolderSchema = z.object({
  nameMr: z.string().min(1),
  nameEn: z.string().min(1),
  postMr: z.string().min(1),
  postEn: z.string().min(1),
  photoUrl: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const updatePostHolderSchema = createPostHolderSchema.partial()

export type CreatePostHolder = z.infer<typeof createPostHolderSchema>
export type UpdatePostHolder = z.infer<typeof updatePostHolderSchema>
