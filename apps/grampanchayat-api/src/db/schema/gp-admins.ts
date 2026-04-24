/**
 * gp_admins — (gp_id, user_id) mapping with role + soft-delete.
 * Controls admin portal access per tenant; user_id references auth.users (Supabase Auth).
 * Roles: 'admin' (full CRUD) | 'viewer' (read-only).
 */
import { sql } from 'drizzle-orm'
import { pgTable, uuid, text, boolean, timestamp, uniqueIndex, index, check } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const GP_ADMIN_ROLES = ['admin', 'viewer'] as const
export type GpAdminRole = (typeof GP_ADMIN_ROLES)[number]

export const gpAdmins = pgTable(
  'gp_admins',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    gpId:      uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull(),
    role:      text('role', { enum: GP_ADMIN_ROLES }).default('admin').notNull(),
    isActive:  boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpUserUidx: uniqueIndex('gp_admins_gp_id_user_id_key').on(t.gpId, t.userId),
    userIdx:    index('idx_gp_admins_user').on(t.userId),
    roleCheck:  check('gp_admins_role_check', sql`${t.role} IN ('admin', 'viewer')`),
  })
)

export type GpAdmin = typeof gpAdmins.$inferSelect
export type NewGpAdmin = typeof gpAdmins.$inferInsert
