import { sql } from 'drizzle-orm'
import { bigint, check, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const gpReceiptSequences = pgTable(
  'gp_receipt_sequences',
  {
    gpId:       uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    fiscalYear: text('fiscal_year').notNull(),
    bookType: text('book_type').notNull().default('property'),
    nextNo:    bigint('next_no', { mode: 'number' }).notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gpId, t.fiscalYear, t.bookType] }),
    bookTypeCheck: check(
      'gp_receipt_sequences_book_type_check',
      sql`${t.bookType} IN ('property', 'water')`
    ),
  })
)

export type GpReceiptSequence = typeof gpReceiptSequences.$inferSelect
export type NewGpReceiptSequence = typeof gpReceiptSequences.$inferInsert
