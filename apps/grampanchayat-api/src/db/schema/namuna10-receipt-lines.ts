import { sql } from 'drizzle-orm'
import { bigint, check, index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { gpNamuna9DemandLines } from './namuna9-demand-lines.ts'
import { gpNamuna10Receipts } from './namuna10-receipts.ts'

export const gpNamuna10ReceiptLines = pgTable(
  'gp_namuna10_receipt_lines',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    receiptId:    uuid('receipt_id')
      .notNull()
      .references(() => gpNamuna10Receipts.id, { onDelete: 'cascade' }),
    demandLineId: uuid('demand_line_id')
      .notNull()
      .references(() => gpNamuna9DemandLines.id, { onDelete: 'restrict' }),
    amountPaise:  bigint('amount_paise', { mode: 'number' }).notNull(),
    createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    receiptDemandLineUidx: uniqueIndex('gp_namuna10_receipt_lines_receipt_demand_line_uidx').on(
      t.receiptId,
      t.demandLineId
    ),
    demandLineIdx: index('gp_namuna10_receipt_lines_demand_line_idx').on(t.demandLineId),
    positiveAmountCheck: check(
      'gp_namuna10_receipt_lines_positive_amount_check',
      sql`${t.amountPaise} > 0`
    ),
  })
)

export type GpNamuna10ReceiptLine = typeof gpNamuna10ReceiptLines.$inferSelect
export type NewGpNamuna10ReceiptLine = typeof gpNamuna10ReceiptLines.$inferInsert
