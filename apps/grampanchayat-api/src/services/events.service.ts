import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { events } from '../db/schema/events.ts'
import { CreateEvent, UpdateEvent } from '../types/events.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

export const eventsService = {
  async list(gpId: string, isPublished?: boolean) {
    const conditions = [eq(events.gpId, gpId)]
    if (isPublished !== undefined) {
      conditions.push(eq(events.isPublished, isPublished))
    }
    return db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.eventDate))
  },

  async getById(gpId: string, id: string) {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.gpId, gpId)))
    if (!event) throw new ApiError(404, 'Event not found')
    return event
  },

  async create(gpId: string, input: CreateEvent) {
    const [created] = await db
      .insert(events)
      .values({ ...input, gpId })
      .returning()
    return created
  },

  async update(gpId: string, id: string, input: UpdateEvent) {
    const [updated] = await db
      .update(events)
      .set(input)
      .where(and(eq(events.id, id), eq(events.gpId, gpId)))
      .returning()
    if (!updated) throw new ApiError(404, 'Event not found')
    return updated
  },

  async delete(gpId: string, id: string) {
    const [deleted] = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.gpId, gpId)))
      .returning()
    if (!deleted) throw new ApiError(404, 'Event not found')
    return deleted
  },
}
