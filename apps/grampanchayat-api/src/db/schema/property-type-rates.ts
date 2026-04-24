/**
 * gp_property_type_rates — per-GP rate master for Namuna 8/9 property tax calculation.
 * One row per (gp_id, property_type); 5 rows max per GP (one per PropertyType enum).
 * किमान/कमाल = state-mandated min/max rate bounds; actual GP rates must fall within them.
 */
import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const PROPERTY_TYPE_KEYS = [
  'jhopdi_mati',
  'dagad_vit_mati',
  'dagad_vit_pucca',
  'navi_rcc',
  'bakhal',
] as const

export type PropertyTypeKey = (typeof PROPERTY_TYPE_KEYS)[number]

export const gpPropertyTypeRates = pgTable(
  'gp_property_type_rates',
  {
    id:                        uuid('id').primaryKey().defaultRandom(),
    gpId:                      uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    propertyType:              text('property_type').notNull(),
    minRate:                   numeric('min_rate', { precision: 12, scale: 4 }),
    maxRate:                   numeric('max_rate', { precision: 12, scale: 4 }),
    landRatePerSqft:           numeric('land_rate_per_sqft', { precision: 12, scale: 4 }),
    constructionRatePerSqft:   numeric('construction_rate_per_sqft', { precision: 12, scale: 4 }),
    newConstructionRatePerSqft: numeric('new_construction_rate_per_sqft', { precision: 12, scale: 4 }),
    createdAt:                 timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:                 timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpPropertyTypeUidx: uniqueIndex('gp_property_type_rates_gp_id_type_uidx').on(t.gpId, t.propertyType),
  })
)

export type GpPropertyTypeRate = typeof gpPropertyTypeRates.$inferSelect
export type NewGpPropertyTypeRate = typeof gpPropertyTypeRates.$inferInsert
