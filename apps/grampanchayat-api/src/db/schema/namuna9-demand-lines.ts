/**
 * gp_namuna9_demand_lines — Namuna 9 per-tax-head demand rows.
 * Exactly three rows per header: house, lighting, sanitation.
 */
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
import { gpNamuna9Demands } from './namuna9-demands.ts'

export const gpNamuna9DemandLines = pgTable(
  'gp_namuna9_demand_lines',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    demandId:      uuid('demand_id')
      .notNull()
      .references(() => gpNamuna9Demands.id, { onDelete: 'cascade' }),
    taxHead:       text('tax_head').notNull(),
    previousPaise: bigint('previous_paise', { mode: 'number' }).default(0).notNull(),
    currentPaise:  bigint('current_paise', { mode: 'number' }).default(0).notNull(),
    paidPaise:     bigint('paid_paise', { mode: 'number' }).default(0).notNull(),
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
    notes:     text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    demandTaxHeadUidx: uniqueIndex('gp_namuna9_demand_lines_demand_tax_head_uidx').on(
      t.demandId,
      t.taxHead
    ),
    demandIdx: index('gp_namuna9_demand_lines_demand_idx').on(t.demandId),
    taxHeadCheck: check(
      'gp_namuna9_demand_lines_tax_head_check',
      sql`${t.taxHead} IN ('house', 'lighting', 'sanitation')`
    ),
    nonNegativePaiseCheck: check(
      'gp_namuna9_demand_lines_nonnegative_paise_check',
      sql`${t.previousPaise} >= 0 AND ${t.currentPaise} >= 0 AND ${t.paidPaise} >= 0`
    ),
    noOverpaymentCheck: check(
      'gp_namuna9_demand_lines_no_overpayment_check',
      sql`${t.paidPaise} <= ${t.previousPaise} + ${t.currentPaise}`
    ),
  })
)

export type GpNamuna9DemandLine = typeof gpNamuna9DemandLines.$inferSelect
export type NewGpNamuna9DemandLine = typeof gpNamuna9DemandLines.$inferInsert
