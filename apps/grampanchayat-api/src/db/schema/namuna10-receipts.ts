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

export const gpNamuna10Receipts = pgTable(
  'gp_namuna10_receipts',
  {
    id:                uuid('id').primaryKey().defaultRandom(),
    gpId:              uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    propertyId:        uuid('property_id')
      .notNull()
      .references(() => gpProperties.id, { onDelete: 'restrict' }),
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
    gpReceiptNoUidx: uniqueIndex('gp_namuna10_receipts_gp_receipt_no_uidx').on(
      t.gpId,
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
  })
)

export type GpNamuna10Receipt = typeof gpNamuna10Receipts.$inferSelect
export type NewGpNamuna10Receipt = typeof gpNamuna10Receipts.$inferInsert
