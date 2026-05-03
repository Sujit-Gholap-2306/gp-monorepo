import { sql } from 'drizzle-orm'
import { bigint, check, index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { gpNamuna9DemandLines } from './namuna9-demand-lines.ts'
import { gpNamuna10Receipts } from './namuna10-receipts.ts'
import { gpWaterConnectionDemandLines } from './water-connection-demand-lines.ts'

export const gpNamuna10ReceiptLines = pgTable(
  'gp_namuna10_receipt_lines',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    receiptId:    uuid('receipt_id')
      .notNull()
      .references(() => gpNamuna10Receipts.id, { onDelete: 'cascade' }),
    demandLineId: uuid('demand_line_id')
      .references(() => gpNamuna9DemandLines.id, { onDelete: 'restrict' }),
    waterDemandLineId: uuid('water_demand_line_id')
      .references(() => gpWaterConnectionDemandLines.id, { onDelete: 'restrict' }),
    amountPaise:  bigint('amount_paise', { mode: 'number' }).notNull(),
    createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    receiptDemandLineUidx: uniqueIndex('gp_namuna10_receipt_lines_receipt_demand_line_uidx').on(
      t.receiptId,
      t.demandLineId
    ),
    receiptWaterDemandLineUidx: uniqueIndex('gp_namuna10_receipt_lines_receipt_water_demand_line_uidx').on(
      t.receiptId,
      t.waterDemandLineId
    ),
    demandLineIdx: index('gp_namuna10_receipt_lines_demand_line_idx').on(t.demandLineId),
    waterDemandLineIdx: index('gp_namuna10_receipt_lines_water_demand_line_idx').on(t.waterDemandLineId),
    targetFkXorCheck: check(
      'gp_namuna10_receipt_lines_target_fk_xor_check',
      sql`
        (
          (${t.demandLineId} IS NOT NULL AND ${t.waterDemandLineId} IS NULL)
          OR
          (${t.demandLineId} IS NULL AND ${t.waterDemandLineId} IS NOT NULL)
        )
      `
    ),
    positiveAmountCheck: check(
      'gp_namuna10_receipt_lines_positive_amount_check',
      sql`${t.amountPaise} > 0`
    ),
  })
)

export type GpNamuna10ReceiptLine = typeof gpNamuna10ReceiptLines.$inferSelect
export type NewGpNamuna10ReceiptLine = typeof gpNamuna10ReceiptLines.$inferInsert
