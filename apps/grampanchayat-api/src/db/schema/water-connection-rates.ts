import { sql } from 'drizzle-orm'
import {
  bigint,
  check,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export { WATER_CONNECTION_TYPES as WATER_CONNECTION_RATE_TYPES } from './water-connections.ts'
export type { WaterConnectionType as WaterConnectionRateType } from './water-connections.ts'

export const gpWaterConnectionRates = pgTable(
  'gp_water_connection_rates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gpId: uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    fiscalYear: text('fiscal_year').notNull(),
    connectionType: text('connection_type').notNull(),
    pipeSizeInch: numeric('pipe_size_inch', { precision: 3, scale: 1 }).notNull(),
    annualPaise: bigint('annual_paise', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpFyTypePipeUidx: uniqueIndex('gp_water_connection_rates_gp_fy_type_pipe_uidx').on(
      t.gpId,
      t.fiscalYear,
      t.connectionType,
      t.pipeSizeInch
    ),
    connectionTypeCheck: check(
      'gp_water_connection_rates_connection_type_check',
      sql`${t.connectionType} IN ('regular', 'specialized')`
    ),
    pipeSizeCheck: check(
      'gp_water_connection_rates_pipe_size_check',
      sql`${t.pipeSizeInch} IN (1.0, 1.5, 2.0, 2.5)`
    ),
    annualPaiseCheck: check(
      'gp_water_connection_rates_annual_paise_check',
      sql`${t.annualPaise} > 0`
    ),
    fiscalYearFormatCheck: check(
      'gp_water_connection_rates_fiscal_year_format_check',
      sql`${t.fiscalYear} ~ '^\\d{4}-\\d{2}$'`
    ),
  })
)

export type GpWaterConnectionRate = typeof gpWaterConnectionRates.$inferSelect
export type NewGpWaterConnectionRate = typeof gpWaterConnectionRates.$inferInsert
