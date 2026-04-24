/**
 * post_holders — elected/appointed post-holders shown on the public site (bilingual).
 */
import { pgTable, uuid, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const postHolders = pgTable(
  'post_holders',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    gpId:       uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    nameMr:     text('name_mr').notNull(),
    nameEn:     text('name_en').notNull(),
    postMr:     text('post_mr').notNull(),
    postEn:     text('post_en').notNull(),
    photoUrl:   text('photo_url'),
    phone:      text('phone'),
    sortOrder:  integer('sort_order').default(0).notNull(),
    isActive:   boolean('is_active').default(true).notNull(),
    createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpIdx: index('idx_post_holders_gp_id').on(t.gpId),
  })
)

export type PostHolder = typeof postHolders.$inferSelect
export type NewPostHolder = typeof postHolders.$inferInsert
