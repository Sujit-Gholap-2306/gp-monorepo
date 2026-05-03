import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { gpProperties } from './properties.ts'
import { gpTenants } from './tenants.ts'
import { gpWaterConnections } from './water-connections.ts'

export const NAMUNA10_BOOK_TYPES = ['property', 'water'] as const
export type Namuna10BookType = (typeof NAMUNA10_BOOK_TYPES)[number]

export const gpNamuna10Receipts = pgTable(
  'gp_namuna10_receipts',
  {
    id:                uuid('id').primaryKey().defaultRandom(),
    gpId:              uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    bookType:          text('book_type').notNull().default('property'),
    propertyId:        uuid('property_id')
      .references(() => gpProperties.id, { onDelete: 'restrict' }),
    waterConnectionId: uuid('water_connection_id')
      .references(() => gpWaterConnections.id, { onDelete: 'restrict' }),
    payerName: text('payer_name').notNull(),
    fiscalYear:        text('fiscal_year').notNull(),
    receiptNo:         text('receipt_no').notNull(),
    paidAt:            timestamp('paid_at', { withTimezone: true }).notNull(),
    paymentMode:       text('payment_mode').notNull(),
    reference:         text('reference'),
    discountPaise:     bigint('discount_paise', { mode: 'number' }).notNull().default(0),
    lateFeePaise:      bigint('late_fee_paise', { mode: 'number' }).notNull().default(0),
    noticeFeePaise:    bigint('notice_fee_paise', { mode: 'number' }).notNull().default(0),
    otherPaise:        bigint('other_paise', { mode: 'number' }).notNull().default(0),
    otherReason:       text('other_reason'),
    isVoid:            boolean('is_void').notNull().default(false),
    voidedAt:          timestamp('voided_at', { withTimezone: true }),
    voidedBy:          uuid('voided_by'),
    voidReason:        text('void_reason'),
    createdBy:         uuid('created_by').notNull(),
    createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:         timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpBookReceiptNoUidx: uniqueIndex('gp_namuna10_receipts_gp_book_receipt_no_uidx').on(
      t.gpId,
      t.bookType,
      t.receiptNo
    ),
    gpFyPaidAtIdx: index('gp_namuna10_receipts_gp_fy_paid_at_idx').on(
      t.gpId,
      t.fiscalYear,
      t.paidAt
    ),
    gpPropertyPaidAtIdx: index('gp_namuna10_receipts_gp_property_paid_at_idx').on(
      t.gpId,
      t.propertyId,
      t.paidAt
    ),
    gpWaterConnectionPaidAtIdx: index('gp_namuna10_receipts_gp_water_connection_paid_at_idx').on(
      t.gpId,
      t.waterConnectionId,
      t.paidAt
    ),
    bookTypeCheck: check(
      'gp_namuna10_receipts_book_type_check',
      sql`${t.bookType} IN ('property', 'water')`
    ),
    targetFkXorCheck: check(
      'gp_namuna10_receipts_target_fk_xor_check',
      sql`
        (
          (${t.bookType} = 'property' AND ${t.propertyId} IS NOT NULL AND ${t.waterConnectionId} IS NULL)
          OR
          (${t.bookType} = 'water' AND ${t.waterConnectionId} IS NOT NULL AND ${t.propertyId} IS NULL)
        )
      `
    ),
    paymentModeCheck: check(
      'gp_namuna10_receipts_payment_mode_check',
      sql`${t.paymentMode} IN ('cash', 'upi', 'cheque', 'neft', 'other')`
    ),
    discountCheck: check(
      'gp_namuna10_receipts_discount_check',
      sql`${t.discountPaise} >= 0`
    ),
    lateFeeCheck: check('gp_namuna10_receipts_late_fee_check', sql`${t.lateFeePaise} >= 0`),
    noticeFeeCheck: check(
      'gp_namuna10_receipts_notice_fee_check',
      sql`${t.noticeFeePaise} >= 0`
    ),
    otherCheck: check('gp_namuna10_receipts_other_check', sql`${t.otherPaise} >= 0`),
    fiscalYearFormatCheck: check(
      'gp_namuna10_receipts_fiscal_year_format_check',
      sql`${t.fiscalYear} ~ '^\d{4}-\d{2}$'`
    ),
  })
)

export type GpNamuna10Receipt = typeof gpNamuna10Receipts.$inferSelect
export type NewGpNamuna10Receipt = typeof gpNamuna10Receipts.$inferInsert
