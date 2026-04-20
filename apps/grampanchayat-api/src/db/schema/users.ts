import {
  pgTable, uuid, text, boolean,
  timestamp, uniqueIndex,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  username:     text('username').notNull().unique(),
  email:        text('email').notNull().unique(),
  fullName:     text('full_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  refreshToken: text('refresh_token'),
  avatarUrl:    text('avatar_url'),
  coverUrl:     text('cover_url'),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  usernameIdx: uniqueIndex('users_username_idx').on(t.username),
  emailIdx:    uniqueIndex('users_email_idx').on(t.email),
}))

export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
