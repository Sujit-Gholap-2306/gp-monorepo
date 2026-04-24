import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { eventMedia } from '../db/schema/event-media.ts'
import { CreateEventMedia, UpdateEventMedia } from '../types/event-media.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

export const eventMediaService = {
  async list(gpId: string, eventId: string) {
    return db
      .select()
      .from(eventMedia)
      .where(and(eq(eventMedia.gpId, gpId), eq(eventMedia.eventId, eventId)))
      .orderBy(asc(eventMedia.sortOrder))
  },

  async getById(gpId: string, eventId: string, id: string) {
    const [media] = await db
      .select()
      .from(eventMedia)
      .where(and(eq(eventMedia.id, id), eq(eventMedia.gpId, gpId), eq(eventMedia.eventId, eventId)))
    if (!media) throw new ApiError(404, 'Event media not found')
    return media
  },

  async create(gpId: string, eventId: string, input: CreateEventMedia) {
    const [created] = await db
      .insert(eventMedia)
      .values({ ...input, gpId, eventId })
      .returning()
    return created
  },

  async update(gpId: string, eventId: string, id: string, input: UpdateEventMedia) {
    const [updated] = await db
      .update(eventMedia)
      .set(input)
      .where(and(eq(eventMedia.id, id), eq(eventMedia.gpId, gpId), eq(eventMedia.eventId, eventId)))
      .returning()
    if (!updated) throw new ApiError(404, 'Event media not found')
    return updated
  },

  async delete(gpId: string, eventId: string, id: string) {
    const [deleted] = await db
      .delete(eventMedia)
      .where(and(eq(eventMedia.id, id), eq(eventMedia.gpId, gpId), eq(eventMedia.eventId, eventId)))
      .returning()
    if (!deleted) throw new ApiError(404, 'Event media not found')
    return deleted
  },
}
