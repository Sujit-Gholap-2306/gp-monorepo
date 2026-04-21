# Drizzle Schema Patterns

## DB Singleton

```ts
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

export const db = drizzle(pool, { schema })
```

---

## Table Definition Pattern

```ts
// src/db/schema/users.ts
import {
  pgTable, uuid, text, boolean,
  timestamp, index, uniqueIndex,
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

// Always export inferred types — never manually type DB rows
export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

---

## Relations

```ts
// src/db/schema/videos.ts
import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const videos = pgTable('videos', {
  id:          uuid('id').primaryKey().defaultRandom(),
  ownerId:     uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:       text('title').notNull(),
  description: text('description'),
  videoUrl:    text('video_url').notNull(),
  thumbnailUrl:text('thumbnail_url'),
  duration:    integer('duration').notNull().default(0),
  views:       integer('views').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const videosRelations = relations(videos, ({ one }) => ({
  owner: one(users, { fields: [videos.ownerId], references: [users.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}))
```

---

## Schema Index (re-export everything)

```ts
// src/db/schema/index.ts
export * from './users'
export * from './videos'
export * from './subscriptions'
// add new tables here
```

---

## Common Query Patterns

```ts
import { db } from '../db'
import { users, videos } from '../db/schema'
import { eq, and, or, ilike, desc, count, sql } from 'drizzle-orm'

// Find one by ID
const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

// Find with column exclusion (no password hash)
const [safeUser] = await db
  .select({ id: users.id, username: users.username, email: users.email })
  .from(users)
  .where(eq(users.id, id))
  .limit(1)

// Insert and return
const [newUser] = await db.insert(users).values(payload).returning()

// Update and return
const [updated] = await db
  .update(users)
  .set({ fullName: 'New Name', updatedAt: new Date() })
  .where(eq(users.id, id))
  .returning()

// Delete
await db.delete(users).where(eq(users.id, id))

// Join
const result = await db
  .select({ video: videos, owner: { id: users.id, username: users.username } })
  .from(videos)
  .leftJoin(users, eq(videos.ownerId, users.id))
  .where(eq(videos.isPublished, true))

// Pagination
const page = Number(req.query.page) || 1
const limit = 20
const rows = await db
  .select()
  .from(videos)
  .limit(limit)
  .offset((page - 1) * limit)
  .orderBy(desc(videos.createdAt))

// Count
const [{ total }] = await db.select({ total: count() }).from(videos)

// Raw SQL for complex queries
const rows = await db.execute(
  sql`SELECT u.*, COUNT(v.id) as video_count
      FROM users u LEFT JOIN videos v ON v.owner_id = u.id
      GROUP BY u.id`
)
```

---

## drizzle.config.ts

```ts
import type { Config } from 'drizzle-kit'
import 'dotenv/config'

export default {
  schema:       './src/db/schema/index.ts',
  out:          './drizzle/migrations',
  dialect:      'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config
```

Migration commands:
```bash
pnpm drizzle-kit generate   # generate SQL from schema changes
pnpm drizzle-kit migrate    # apply pending migrations
pnpm drizzle-kit push       # push directly (dev only — skips migration files)
pnpm drizzle-kit studio     # open browser DB viewer
```
