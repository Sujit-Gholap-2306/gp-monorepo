/**
 * events — GP event calendar (bilingual); event_media holds attachments.
 */
import { pgTable, uuid, text, date, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const events = pgTable(
  'events',
  {
    id:             uuid('id').primaryKey().defaultRandom(),
    gpId:           uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    titleMr:        text('title_mr').notNull(),
    titleEn:        text('title_en').notNull(),
    descriptionMr:  text('description_mr'),
    descriptionEn:  text('description_en'),
    eventDate:      date('event_date').notNull(),
    locationMr:     text('location_mr'),
    locationEn:     text('location_en'),
    isPublished:    boolean('is_published').default(false).notNull(),
    createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpDateIdx: index('idx_events_gp_id_date').on(t.gpId, t.eventDate),
  })
)

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
