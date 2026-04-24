import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { postHolders } from '../db/schema/post-holders.ts'
import { CreatePostHolder, UpdatePostHolder } from '../types/post-holders.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

export const postHoldersService = {
  async list(gpId: string) {
    return db
      .select()
      .from(postHolders)
      .where(eq(postHolders.gpId, gpId))
      .orderBy(asc(postHolders.sortOrder))
  },

  async getById(gpId: string, id: string) {
    const [holder] = await db
      .select()
      .from(postHolders)
      .where(and(eq(postHolders.id, id), eq(postHolders.gpId, gpId)))
    if (!holder) throw new ApiError(404, 'Post holder not found')
    return holder
  },

  async create(gpId: string, input: CreatePostHolder) {
    const [created] = await db
      .insert(postHolders)
      .values({ ...input, gpId })
      .returning()
    return created
  },

  async update(gpId: string, id: string, input: UpdatePostHolder) {
    const [updated] = await db
      .update(postHolders)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(postHolders.id, id), eq(postHolders.gpId, gpId)))
      .returning()
    if (!updated) throw new ApiError(404, 'Post holder not found')
    return updated
  },

  async delete(gpId: string, id: string) {
    const [deleted] = await db
      .delete(postHolders)
      .where(and(eq(postHolders.id, id), eq(postHolders.gpId, gpId)))
      .returning()
    if (!deleted) throw new ApiError(404, 'Post holder not found')
    return deleted
  },
}
