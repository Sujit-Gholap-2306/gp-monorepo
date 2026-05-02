import { sql } from 'drizzle-orm'
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'
import { gpWaterConnections } from './water-connections.ts'

export const gpWaterConnectionDemands = pgTable(
  'gp_water_connection_demands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gpId: uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    waterConnectionId: uuid('water_connection_id')
      .notNull()
      .references(() => gpWaterConnections.id, { onDelete: 'restrict' }),
    fiscalYear: text('fiscal_year').notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    generatedBy: uuid('generated_by'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpConnectionFyUidx: uniqueIndex('gp_water_connection_demands_gp_connection_fy_uidx').on(
      t.gpId,
      t.waterConnectionId,
      t.fiscalYear
    ),
    gpFyIdx: index('gp_water_connection_demands_gp_fy_idx').on(t.gpId, t.fiscalYear),
    fiscalYearFormatCheck: check(
      'gp_water_connection_demands_fiscal_year_format_check',
      sql`${t.fiscalYear} ~ '^\\d{4}-\\d{2}$'`
    ),
  })
)

export type GpWaterConnectionDemand = typeof gpWaterConnectionDemands.$inferSelect
export type NewGpWaterConnectionDemand = typeof gpWaterConnectionDemands.$inferInsert
