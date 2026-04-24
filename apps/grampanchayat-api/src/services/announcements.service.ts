import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { announcements } from '../db/schema/announcements.ts'
import { CreateAnnouncement, UpdateAnnouncement } from '../types/announcements.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

export const announcementsService = {
  async list(gpId: string, isPublished?: boolean) {
    const conditions = [eq(announcements.gpId, gpId)]
    if (isPublished !== undefined) {
      conditions.push(eq(announcements.isPublished, isPublished))
    }
    return db
      .select()
      .from(announcements)
      .where(and(...conditions))
      .orderBy(desc(announcements.createdAt))
  },

  async getById(gpId: string, id: string) {
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.gpId, gpId)))
    if (!announcement) throw new ApiError(404, 'Announcement not found')
    return announcement
  },

  async create(gpId: string, input: CreateAnnouncement) {
    const payload = {
      ...input,
      gpId,
      publishedAt: input.isPublished ? new Date() : null,
    }
    const [created] = await db.insert(announcements).values(payload).returning()
    return created
  },

  async update(gpId: string, id: string, input: UpdateAnnouncement) {
    const current = await this.getById(gpId, id)

    const nextPublished =
      input.isPublished !== undefined ? input.isPublished : current.isPublished

    let publishedAt: Date | null
    if (input.isPublished === true) {
      publishedAt = current.publishedAt ?? new Date()
    } else if (input.isPublished === false) {
      publishedAt = null
    } else {
      if (nextPublished && !current.publishedAt) {
        publishedAt = new Date()
      } else {
        publishedAt = current.publishedAt
      }
    }

    if (nextPublished && !publishedAt) {
      publishedAt = new Date()
    }
    if (!nextPublished) {
      publishedAt = null
    }

    const payload: Record<string, unknown> = { ...input }
    payload.publishedAt = publishedAt
    payload.isPublished = nextPublished

    const [updated] = await db
      .update(announcements)
      .set(payload as any)
      .where(and(eq(announcements.id, id), eq(announcements.gpId, gpId)))
      .returning()
    if (!updated) throw new ApiError(404, 'Announcement not found')
    return updated
  },

  async delete(gpId: string, id: string) {
    const [deleted] = await db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.gpId, gpId)))
      .returning()
    if (!deleted) throw new ApiError(404, 'Announcement not found')
    return deleted
  },
}
