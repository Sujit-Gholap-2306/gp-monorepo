/**
 * gp_namuna9_demands — Namuna 9 demand header.
 * One row per GP × property × fiscal year; child lines hold tax-head amounts.
 */
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'
import { gpProperties } from './properties.ts'

export const gpNamuna9Demands = pgTable(
  'gp_namuna9_demands',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    gpId:        uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    propertyId:  uuid('property_id')
      .notNull()
      .references(() => gpProperties.id, { onDelete: 'restrict' }),
    fiscalYear:  text('fiscal_year').notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    generatedBy: uuid('generated_by'),
    notes:       text('notes'),
    createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpPropertyFyUidx: uniqueIndex('gp_namuna9_demands_gp_property_fy_uidx').on(
      t.gpId,
      t.propertyId,
      t.fiscalYear
    ),
    gpFyIdx:       index('gp_namuna9_demands_gp_fy_idx').on(t.gpId, t.fiscalYear),
    gpPropertyIdx: index('gp_namuna9_demands_gp_property_idx').on(t.gpId, t.propertyId),
  })
)

export type GpNamuna9Demand = typeof gpNamuna9Demands.$inferSelect
export type NewGpNamuna9Demand = typeof gpNamuna9Demands.$inferInsert
