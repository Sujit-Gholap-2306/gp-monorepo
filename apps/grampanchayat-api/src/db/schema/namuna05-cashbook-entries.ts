import { sql } from 'drizzle-orm'
import {
  bigint,
  check,
  date,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const gpAccountHeadEnum = pgEnum('gp_account_head', [
  'property_tax_house',
  'property_tax_lighting',
  'property_tax_sanitation',
  'property_tax_water',
  'discount',
  'late_fee',
  'notice_fee',
  'other',
])

export const gpNamuna05CashbookEntries = pgTable(
  'gp_namuna05_cashbook_entries',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    gpId:       uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    entryDate:  date('entry_date').notNull(),
    fiscalYear: text('fiscal_year').notNull(),
    fyMonthNo:  smallint('fy_month_no').notNull(),
    entryType:  text('entry_type').notNull(),
    accountHead: gpAccountHeadEnum('account_head').notNull(),
    description: text('description'),
    amountPaise: bigint('amount_paise', { mode: 'number' }).notNull(),
    sourceType:  text('source_type').notNull(),
    sourceId:    uuid('source_id'),
    sourceLineId: uuid('source_line_id'),
    createdBy:   uuid('created_by').notNull(),
    createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpEntryDateIdx: index('gp_namuna05_cashbook_entries_gp_entry_date_idx').on(
      t.gpId,
      t.entryDate,
      t.id
    ),
    gpFyMonthHeadIdx: index('gp_namuna05_cashbook_entries_gp_fy_month_head_idx').on(
      t.gpId,
      t.fiscalYear,
      t.fyMonthNo,
      t.accountHead
    ),
    sourceTypeIdIdx: index('gp_namuna05_cashbook_entries_source_type_id_idx').on(
      t.sourceType,
      t.sourceId
    ),
    amountPositiveCheck: check(
      'gp_namuna05_cashbook_entries_amount_positive_check',
      sql`${t.amountPaise} > 0`
    ),
    entryTypeCheck: check(
      'gp_namuna05_cashbook_entries_entry_type_check',
      sql`${t.entryType} IN ('credit', 'debit')`
    ),
    sourceTypeCheck: check(
      'gp_namuna05_cashbook_entries_source_type_check',
      sql`${t.sourceType} IN ('namuna10', 'namuna10_void', 'manual')`
    ),
    fyMonthNoCheck: check(
      'gp_namuna05_cashbook_entries_fy_month_no_check',
      sql`${t.fyMonthNo} >= 1 AND ${t.fyMonthNo} <= 12`
    ),
    sourceIdRequiredCheck: check(
      'gp_namuna05_cashbook_entries_source_id_required_check',
      sql`${t.sourceType} = 'manual' OR ${t.sourceId} IS NOT NULL`
    ),
    taxLineSourceLineCheck: check(
      'gp_namuna05_cashbook_entries_tax_line_source_line_check',
      sql`${t.sourceType} = 'manual' OR ${t.accountHead} NOT IN ('property_tax_house', 'property_tax_lighting', 'property_tax_sanitation', 'property_tax_water') OR ${t.sourceLineId} IS NOT NULL`
    ),
    adjustmentNoSourceLineCheck: check(
      'gp_namuna05_cashbook_entries_adjustment_no_source_line_check',
      sql`${t.accountHead} NOT IN ('discount', 'late_fee', 'notice_fee', 'other') OR ${t.sourceLineId} IS NULL`
    ),
  })
)

export type GpNamuna05CashbookEntry = typeof gpNamuna05CashbookEntries.$inferSelect
export type NewGpNamuna05CashbookEntry = typeof gpNamuna05CashbookEntries.$inferInsert
