import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gallery } from '../db/schema/gallery.ts'
import { CreateGalleryItem, UpdateGalleryItem } from '../types/gallery.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

export const galleryService = {
  async list(gpId: string) {
    return db
      .select()
      .from(gallery)
      .where(eq(gallery.gpId, gpId))
      .orderBy(asc(gallery.sortOrder))
  },

  async getById(gpId: string, id: string) {
    const [item] = await db
      .select()
      .from(gallery)
      .where(and(eq(gallery.id, id), eq(gallery.gpId, gpId)))
    if (!item) throw new ApiError(404, 'Gallery item not found')
    return item
  },

  async create(gpId: string, input: CreateGalleryItem) {
    const payload = {
      ...input,
      gpId,
      takenAt: input.takenAt ? new Date(input.takenAt) : null,
    }
    const [created] = await db.insert(gallery).values(payload).returning()
    return created
  },

  async update(gpId: string, id: string, input: UpdateGalleryItem) {
    const payload: any = { ...input }
    if (input.takenAt !== undefined) {
      payload.takenAt = input.takenAt ? new Date(input.takenAt) : null
    }

    const [updated] = await db
      .update(gallery)
      .set(payload)
      .where(and(eq(gallery.id, id), eq(gallery.gpId, gpId)))
      .returning()
    if (!updated) throw new ApiError(404, 'Gallery item not found')
    return updated
  },

  async delete(gpId: string, id: string) {
    const [deleted] = await db
      .delete(gallery)
      .where(and(eq(gallery.id, id), eq(gallery.gpId, gpId)))
      .returning()
    if (!deleted) throw new ApiError(404, 'Gallery item not found')
    return deleted
  },
}
