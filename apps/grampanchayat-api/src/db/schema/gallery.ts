/**
 * gallery — public photo/video grid per GP.
 */
import { sql } from 'drizzle-orm'
import { pgTable, uuid, text, integer, timestamp, index, check } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const GALLERY_MEDIA_TYPES = ['photo', 'video'] as const
export type GalleryMediaType = (typeof GALLERY_MEDIA_TYPES)[number]

export const gallery = pgTable(
  'gallery',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    gpId:       uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    url:        text('url').notNull(),
    type:       text('type', { enum: GALLERY_MEDIA_TYPES }).notNull(),
    captionMr:  text('caption_mr'),
    captionEn:  text('caption_en'),
    takenAt:    timestamp('taken_at', { withTimezone: true }),
    sortOrder:  integer('sort_order').default(0).notNull(),
  },
  (t) => ({
    gpIdx: index('idx_gallery_gp_id').on(t.gpId),
    typeCheck: check('gallery_type_check', sql`${t.type} IN ('photo', 'video')`),
  })
)

export type GalleryItem = typeof gallery.$inferSelect
export type NewGalleryItem = typeof gallery.$inferInsert
