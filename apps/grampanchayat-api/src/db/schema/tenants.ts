import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'

export const gpTenants = pgTable('gp_tenants', {
  id:           uuid('id').primaryKey().defaultRandom(),
  nameMr:       text('name_mr').notNull(),
  nameEn:       text('name_en').notNull(),
  subdomain:    text('subdomain').notNull().unique(),
  established:  timestamp('established', { withTimezone: true }),
  logoUrl:      text('logo_url'),
  contact:      jsonb('contact'),
  village:      jsonb('village'),
  // New columns for multi-tenant portal configuration
  portalTheme:  text('portal_theme').default('civic-elegant').notNull(),
  portalConfig: jsonb('portal_config').default({}).notNull(),
  featureFlags: jsonb('feature_flags').default({
    showProgress: true,
    showMap: true,
    showAchievements: true,
  }).notNull(),
  tier:         text('tier', { enum: ['free', 'pro', 'enterprise'] })
                .default('free')
                .notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type GpTenant = typeof gpTenants.$inferSelect
export type NewGpTenant = typeof gpTenants.$inferInsert
