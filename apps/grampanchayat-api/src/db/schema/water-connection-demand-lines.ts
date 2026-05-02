import { sql } from 'drizzle-orm'
import {
  bigint,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { gpWaterConnectionDemands } from './water-connection-demands.ts'

export const gpWaterConnectionDemandLines = pgTable(
  'gp_water_connection_demand_lines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    demandId: uuid('demand_id')
      .notNull()
      .references(() => gpWaterConnectionDemands.id, { onDelete: 'cascade' }),
    previousPaise: bigint('previous_paise', { mode: 'number' }).default(0).notNull(),
    currentPaise: bigint('current_paise', { mode: 'number' }).default(0).notNull(),
    paidPaise: bigint('paid_paise', { mode: 'number' }).default(0).notNull(),
    totalDuePaise: bigint('total_due_paise', { mode: 'number' }).generatedAlwaysAs(
      sql`previous_paise + current_paise - paid_paise`
    ),
    status: text('status').generatedAlwaysAs(sql`
      CASE
        WHEN previous_paise + current_paise = 0 THEN 'paid'
        WHEN paid_paise = 0 THEN 'pending'
        WHEN paid_paise >= previous_paise + current_paise THEN 'paid'
        ELSE 'partial'
      END
    `),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    demandUidx: uniqueIndex('gp_water_connection_demand_lines_demand_uidx').on(t.demandId),
    nonNegativePaiseCheck: check(
      'gp_water_connection_demand_lines_nonnegative_paise_check',
      sql`${t.previousPaise} >= 0 AND ${t.currentPaise} >= 0 AND ${t.paidPaise} >= 0`
    ),
    noOverpaymentCheck: check(
      'gp_water_connection_demand_lines_no_overpayment_check',
      sql`${t.paidPaise} <= ${t.previousPaise} + ${t.currentPaise}`
    ),
  })
)

export type GpWaterConnectionDemandLine = typeof gpWaterConnectionDemandLines.$inferSelect
export type NewGpWaterConnectionDemandLine = typeof gpWaterConnectionDemandLines.$inferInsert
