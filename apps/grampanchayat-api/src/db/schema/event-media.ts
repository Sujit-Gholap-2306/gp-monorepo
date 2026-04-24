/**
 * event_media — photos/videos attached to an event.
 */
import { sql } from 'drizzle-orm'
import { pgTable, uuid, text, integer, index, check } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'
import { events } from './events.ts'

export const EVENT_MEDIA_TYPES = ['photo', 'video'] as const
export type EventMediaType = (typeof EVENT_MEDIA_TYPES)[number]

export const eventMedia = pgTable(
  'event_media',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    eventId:    uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    gpId:       uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    url:        text('url').notNull(),
    type:       text('type', { enum: EVENT_MEDIA_TYPES }).notNull(),
    caption:    text('caption'),
    sortOrder:  integer('sort_order').default(0).notNull(),
  },
  (t) => ({
    eventIdx: index('idx_event_media_event').on(t.eventId),
    typeCheck: check('event_media_type_check', sql`${t.type} IN ('photo', 'video')`),
  })
)

export type EventMedia = typeof eventMedia.$inferSelect
export type NewEventMedia = typeof eventMedia.$inferInsert
