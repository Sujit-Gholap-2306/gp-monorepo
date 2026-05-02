import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gpAdmins } from '../db/schema/gp-admins.ts'
import { CreateGpAdmin, UpdateGpAdmin } from '../types/gp-admins.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

export const gpAdminsService = {
  async list(gpId: string) {
    return db
      .select()
      .from(gpAdmins)
      .where(and(eq(gpAdmins.gpId, gpId), isNull(gpAdmins.deletedAt)))
  },

  async getMe(gpId: string, userId: string) {
    const [admin] = await db
      .select()
      .from(gpAdmins)
      .where(
        and(
          eq(gpAdmins.gpId, gpId),
          eq(gpAdmins.userId, userId),
          isNull(gpAdmins.deletedAt),
          eq(gpAdmins.isActive, true)
        )
      )
    if (!admin) throw new ApiError(404, 'Admin not found')
    return admin
  },

  async getById(gpId: string, id: string) {
    const [admin] = await db
      .select()
      .from(gpAdmins)
      .where(and(eq(gpAdmins.id, id), eq(gpAdmins.gpId, gpId), isNull(gpAdmins.deletedAt)))
    if (!admin) throw new ApiError(404, 'Admin not found')
    return admin
  },

  async create(gpId: string, input: CreateGpAdmin) {
    const [created] = await db
      .insert(gpAdmins)
      .values({ ...input, gpId })
      .returning()
    return created
  },

  async update(gpId: string, id: string, input: UpdateGpAdmin) {
    const [updated] = await db
      .update(gpAdmins)
      .set({ role: input.role, isActive: input.isActive, updatedAt: new Date() })
      .where(and(eq(gpAdmins.id, id), eq(gpAdmins.gpId, gpId), isNull(gpAdmins.deletedAt)))
      .returning()
    if (!updated) throw new ApiError(404, 'Admin not found')
    return updated
  },

  async delete(gpId: string, id: string) {
    const [deleted] = await db
      .update(gpAdmins)
      .set({ deletedAt: new Date() })
      .where(and(eq(gpAdmins.id, id), eq(gpAdmins.gpId, gpId), isNull(gpAdmins.deletedAt)))
      .returning()
    if (!deleted) throw new ApiError(404, 'Admin not found')
    return deleted
  },
}
