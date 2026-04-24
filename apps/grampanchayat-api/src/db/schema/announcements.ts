/**
 * announcements — public-facing notices per GP (bilingual).
 * Integrity rule: is_published=true requires published_at NOT NULL (enforced by CHECK).
 */
import { sql } from 'drizzle-orm'
import { pgTable, uuid, text, boolean, timestamp, index, check } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const announcements = pgTable(
  'announcements',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    gpId:         uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    titleMr:      text('title_mr').notNull(),
    titleEn:      text('title_en').notNull(),
    contentMr:    text('content_mr'),
    contentEn:    text('content_en'),
    category:     text('category').default('general').notNull(),
    docUrl:       text('doc_url'),
    isPublished:  boolean('is_published').default(false).notNull(),
    publishedAt:  timestamp('published_at', { withTimezone: true }),
    createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpIdx: index('idx_announcements_gp_id').on(t.gpId),
    publishedCoherent: check(
      'announcements_published_coherent',
      sql`NOT ${t.isPublished} OR ${t.publishedAt} IS NOT NULL`
    ),
  })
)

export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert
