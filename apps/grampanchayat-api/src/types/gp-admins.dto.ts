import { z } from 'zod'
import { GP_ADMIN_ROLES } from '../db/schema/gp-admins.ts'

export const createGpAdminSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(GP_ADMIN_ROLES).default('admin'),
  isActive: z.boolean().default(true),
})

export const updateGpAdminSchema = createGpAdminSchema.omit({ userId: true }).partial()

export type CreateGpAdmin = z.infer<typeof createGpAdminSchema>
export type UpdateGpAdmin = z.infer<typeof updateGpAdminSchema>
