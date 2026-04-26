# Phase 14 — N10 Schema Implementation Guide

> Use this doc to implement Phase 14 with GPT or Cursor.
> Phase 14 = **database tables + views only**. No service, no controller, no routes, no UI.
> That is Phase 15.

---

## What we are building

When a citizen pays tax at the GP office, we need to record:

1. **The receipt** — who paid, when, how much, what payment mode
2. **The receipt lines** — how that payment splits across tax heads (house, lighting, sanitation, water)
3. **A sequence counter** — to give receipt numbers like `2026-27/000142`
4. **Two read-only SQL views** — so we never store derived totals (keeps data clean)

---

## Project conventions to follow

- Drizzle ORM with `postgres.js` driver
- All schema files in `apps/grampanchayat-api/src/db/schema/`
- All money stored as `bigint` paise (integer). Never floats. Never rupees in DB.
- `createdAt` / `updatedAt` on every table
- Snake_case column names in DB, camelCase in TypeScript
- Export everything from `apps/grampanchayat-api/src/db/schema/index.ts`
- Migration SQL goes in `apps/grampanchayat-api/drizzle/migrations/` — next number is `0007`

### Example schema file to copy style from:
`apps/grampanchayat-api/src/db/schema/namuna9-demand-lines.ts`

---

## File 1 — `gp_receipt_sequences` table

**File:** `apps/grampanchayat-api/src/db/schema/receipt-sequences.ts`

**Purpose:** Tracks the next receipt number per GP per fiscal year. Used inside the receipt creation transaction to allocate a unique, sequential number without race conditions.

**TypeScript schema:**

```ts
import { bigint, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const gpReceiptSequences = pgTable(
  'gp_receipt_sequences',
  {
    gpId:       uuid('gp_id').notNull().references(() => gpTenants.id, { onDelete: 'cascade' }),
    fiscalYear: text('fiscal_year').notNull(),
    nextNo:     bigint('next_no', { mode: 'number' }).notNull().default(1),
    updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gpId, t.fiscalYear] }),
  })
)

export type GpReceiptSequence = typeof gpReceiptSequences.$inferSelect
export type NewGpReceiptSequence = typeof gpReceiptSequences.$inferInsert
```

**How receipt number is allocated (important — implement exactly this in Phase 15):**

```sql
INSERT INTO gp_receipt_sequences (gp_id, fiscal_year, next_no)
VALUES ($gpId, $fiscalYear, 2)
ON CONFLICT (gp_id, fiscal_year) DO UPDATE
  SET next_no    = gp_receipt_sequences.next_no + 1,
      updated_at = now()
RETURNING next_no - 1 AS allocated;
```

This runs inside the receipt INSERT transaction. The row-level lock on `(gp_id, fiscal_year)` prevents two concurrent clerks from getting the same number.

Receipt number format: `'2026-27/000142'` — fiscal year + `/` + 6-digit zero-padded `allocated`.

---

## File 2 — `gp_namuna10_receipts` table

**File:** `apps/grampanchayat-api/src/db/schema/namuna10-receipts.ts`

**Purpose:** One row per payment event. Header only — amounts come from the lines table.

**TypeScript schema:**

```ts
import { boolean, check, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { bigint } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { gpTenants } from './tenants.ts'
import { gpProperties } from './properties.ts'
import { gpCitizens } from './citizens.ts'

export const gpNamuna10Receipts = pgTable(
  'gp_namuna10_receipts',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    gpId:       uuid('gp_id').notNull().references(() => gpTenants.id, { onDelete: 'cascade' }),
    propertyId: uuid('property_id').notNull().references(() => gpProperties.id, { onDelete: 'restrict' }),

    // Payer: known citizen (FK) OR walk-in free text. Exactly one must be set.
    // CHECK constraint enforces this below.
    payerCitizenId:    uuid('payer_citizen_id').references(() => gpCitizens.id, { onDelete: 'restrict' }),
    payerNameFreetext: text('payer_name_freetext'),

    fiscalYear:  text('fiscal_year').notNull(),
    receiptNo:   text('receipt_no').notNull(),       // '2026-27/000142'

    paidAt:      timestamp('paid_at', { withTimezone: true }).notNull(),
    paymentMode: text('payment_mode').notNull(),     // see CHECK below
    reference:   text('reference'),                  // cheque no / UPI txn / NEFT UTR

    // Adjustments (all in paise, always >= 0)
    discountPaise:   bigint('discount_paise',   { mode: 'number' }).notNull().default(0),
    lateFeePaise:    bigint('late_fee_paise',   { mode: 'number' }).notNull().default(0),
    noticeFeePaise:  bigint('notice_fee_paise', { mode: 'number' }).notNull().default(0),
    otherPaise:      bigint('other_paise',      { mode: 'number' }).notNull().default(0),
    otherReason:     text('other_reason'),

    // Void support
    isVoid:     boolean('is_void').notNull().default(false),
    voidedAt:   timestamp('voided_at',  { withTimezone: true }),
    voidedBy:   uuid('voided_by'),
    voidReason: text('void_reason'),

    createdBy:  uuid('created_by').notNull(),
    createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpReceiptNoUidx:    uniqueIndex('gp_namuna10_receipts_gp_receipt_no_uidx').on(t.gpId, t.receiptNo),
    gpFyPaidAtIdx:      index('gp_namuna10_receipts_gp_fy_paid_at_idx').on(t.gpId, t.fiscalYear, t.paidAt),
    gpPropertyPaidAtIdx:index('gp_namuna10_receipts_gp_property_paid_at_idx').on(t.gpId, t.propertyId, t.paidAt),

    payerCheck: check(
      'gp_namuna10_receipts_payer_check',
      sql`(${t.payerCitizenId} IS NOT NULL) OR (${t.payerNameFreetext} IS NOT NULL)`
    ),
    paymentModeCheck: check(
      'gp_namuna10_receipts_payment_mode_check',
      sql`${t.paymentMode} IN ('cash', 'upi', 'cheque', 'neft', 'other')`
    ),
    discountCheck:    check('gp_namuna10_receipts_discount_check',    sql`${t.discountPaise}   >= 0`),
    lateFeeCheck:     check('gp_namuna10_receipts_late_fee_check',    sql`${t.lateFeePaise}    >= 0`),
    noticeFeeCheck:   check('gp_namuna10_receipts_notice_fee_check',  sql`${t.noticeFeePaise}  >= 0`),
    otherCheck:       check('gp_namuna10_receipts_other_check',       sql`${t.otherPaise}      >= 0`),
  })
)

export type GpNamuna10Receipt = typeof gpNamuna10Receipts.$inferSelect
export type NewGpNamuna10Receipt = typeof gpNamuna10Receipts.$inferInsert
```

**Key rules:**
- `receiptNo` is unique per GP (not globally). Two GPs can both have `2026-27/000001`.
- `discountPaise` is a debit (reduces total). `lateFeePaise`, `noticeFeePaise`, `otherPaise` are credits (add to total).
- Total formula (computed by view, not stored): `lines_total - discount + late_fee + notice_fee + other`
- Void never deletes a row. Receipt number is never reused.

---

## File 3 — `gp_namuna10_receipt_lines` table

**File:** `apps/grampanchayat-api/src/db/schema/namuna10-receipt-lines.ts`

**Purpose:** One row per (receipt × demand-line). Each row says "this receipt paid X paise against this specific demand-line (= specific tax head for specific property)."

**TypeScript schema:**

```ts
import { bigint, check, index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { gpNamuna10Receipts } from './namuna10-receipts.ts'
import { gpNamuna9DemandLines } from './namuna9-demand-lines.ts'

export const gpNamuna10ReceiptLines = pgTable(
  'gp_namuna10_receipt_lines',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    receiptId:    uuid('receipt_id').notNull().references(() => gpNamuna10Receipts.id, { onDelete: 'cascade' }),
    demandLineId: uuid('demand_line_id').notNull().references(() => gpNamuna9DemandLines.id, { onDelete: 'restrict' }),
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
```

**Key rules:**
- Tax head (`house`, `lighting`, etc.) is NOT stored here. Derived by joining to `gp_namuna9_demand_lines.tax_head`.
- One demand-line per receipt — can't pay the same head twice on one receipt.
- `onDelete: 'restrict'` on `demand_line_id` — cannot delete a demand-line that has been paid.

---

## File 4 — Update `schema/index.ts`

Add three exports:

```ts
export * from './receipt-sequences.ts'
export * from './namuna10-receipts.ts'
export * from './namuna10-receipt-lines.ts'
```

---

## File 5 — Migration SQL

**File:** `apps/grampanchayat-api/drizzle/migrations/0007_n10_schema.sql`

```sql
-- gp_receipt_sequences
CREATE TABLE IF NOT EXISTS "gp_receipt_sequences" (
  "gp_id"       uuid        NOT NULL REFERENCES "gp_tenants"("id") ON DELETE CASCADE,
  "fiscal_year" text        NOT NULL,
  "next_no"     bigint      NOT NULL DEFAULT 1,
  "updated_at"  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("gp_id", "fiscal_year")
);

-- gp_namuna10_receipts
CREATE TABLE IF NOT EXISTS "gp_namuna10_receipts" (
  "id"                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  "gp_id"                uuid        NOT NULL REFERENCES "gp_tenants"("id") ON DELETE CASCADE,
  "property_id"          uuid        NOT NULL REFERENCES "gp_properties"("id") ON DELETE RESTRICT,
  "payer_citizen_id"     uuid        REFERENCES "gp_citizens"("id") ON DELETE RESTRICT,
  "payer_name_freetext"  text,
  "fiscal_year"          text        NOT NULL,
  "receipt_no"           text        NOT NULL,
  "paid_at"              timestamptz NOT NULL,
  "payment_mode"         text        NOT NULL,
  "reference"            text,
  "discount_paise"       bigint      NOT NULL DEFAULT 0,
  "late_fee_paise"       bigint      NOT NULL DEFAULT 0,
  "notice_fee_paise"     bigint      NOT NULL DEFAULT 0,
  "other_paise"          bigint      NOT NULL DEFAULT 0,
  "other_reason"         text,
  "is_void"              boolean     NOT NULL DEFAULT false,
  "voided_at"            timestamptz,
  "voided_by"            uuid,
  "void_reason"          text,
  "created_by"           uuid        NOT NULL,
  "created_at"           timestamptz NOT NULL DEFAULT now(),
  "updated_at"           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "gp_namuna10_receipts_payer_check"
    CHECK (("payer_citizen_id" IS NOT NULL) OR ("payer_name_freetext" IS NOT NULL)),
  CONSTRAINT "gp_namuna10_receipts_payment_mode_check"
    CHECK ("payment_mode" IN ('cash','upi','cheque','neft','other')),
  CONSTRAINT "gp_namuna10_receipts_discount_check"   CHECK ("discount_paise"   >= 0),
  CONSTRAINT "gp_namuna10_receipts_late_fee_check"   CHECK ("late_fee_paise"   >= 0),
  CONSTRAINT "gp_namuna10_receipts_notice_fee_check" CHECK ("notice_fee_paise" >= 0),
  CONSTRAINT "gp_namuna10_receipts_other_check"      CHECK ("other_paise"      >= 0)
);

CREATE UNIQUE INDEX "gp_namuna10_receipts_gp_receipt_no_uidx"
  ON "gp_namuna10_receipts"("gp_id", "receipt_no");
CREATE INDEX "gp_namuna10_receipts_gp_fy_paid_at_idx"
  ON "gp_namuna10_receipts"("gp_id", "fiscal_year", "paid_at");
CREATE INDEX "gp_namuna10_receipts_gp_property_paid_at_idx"
  ON "gp_namuna10_receipts"("gp_id", "property_id", "paid_at");

-- gp_namuna10_receipt_lines
CREATE TABLE IF NOT EXISTS "gp_namuna10_receipt_lines" (
  "id"             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  "receipt_id"     uuid        NOT NULL REFERENCES "gp_namuna10_receipts"("id") ON DELETE CASCADE,
  "demand_line_id" uuid        NOT NULL REFERENCES "gp_namuna9_demand_lines"("id") ON DELETE RESTRICT,
  "amount_paise"   bigint      NOT NULL,
  "created_at"     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "gp_namuna10_receipt_lines_positive_amount_check"
    CHECK ("amount_paise" > 0)
);

CREATE UNIQUE INDEX "gp_namuna10_receipt_lines_receipt_demand_line_uidx"
  ON "gp_namuna10_receipt_lines"("receipt_id", "demand_line_id");
CREATE INDEX "gp_namuna10_receipt_lines_demand_line_idx"
  ON "gp_namuna10_receipt_lines"("demand_line_id");

-- VIEW: per-receipt totals (no stored total on header — compute on read)
CREATE OR REPLACE VIEW "gp_namuna10_receipt_totals" AS
SELECT
  r.id                                                          AS receipt_id,
  COALESCE(SUM(rl.amount_paise), 0)                            AS lines_total_paise,
  (
    COALESCE(SUM(rl.amount_paise), 0)
    - r.discount_paise
    + r.late_fee_paise
    + r.notice_fee_paise
    + r.other_paise
  )                                                             AS total_paise
FROM "gp_namuna10_receipts" r
LEFT JOIN "gp_namuna10_receipt_lines" rl ON rl.receipt_id = r.id
GROUP BY r.id, r.discount_paise, r.late_fee_paise, r.notice_fee_paise, r.other_paise;

-- VIEW: arrears-first split for bill/print display
-- Shows how much of paid_paise cleared old arrears vs current year demand.
-- Deterministic: arrears cleared first, then current year.
CREATE OR REPLACE VIEW "gp_namuna9_demand_line_split" AS
SELECT
  dl.id                                                                                AS demand_line_id,
  dl.previous_paise,
  dl.current_paise,
  dl.paid_paise,
  GREATEST(0, dl.previous_paise - dl.paid_paise)                                      AS arrears_outstanding_paise,
  GREATEST(0, dl.current_paise - GREATEST(0, dl.paid_paise - dl.previous_paise))      AS current_outstanding_paise
FROM "gp_namuna9_demand_lines" dl;
```

---

## Migration journal entry

After creating the SQL file, add this entry to `apps/grampanchayat-api/drizzle/migrations/meta/_journal.json` inside the `"entries"` array:

```json
{
  "idx": 7,
  "version": "7",
  "when": <current_unix_ms>,
  "tag": "0007_n10_schema",
  "breakpoints": true
}
```

---

## Verify gate (run these before saying done)

```bash
# 1. Typecheck
cd apps/grampanchayat-api && npx tsc --noEmit

# 2. Migration runs clean (on dev DB)
pnpm --filter @gp/grampanchayat-api db:migrate

# 3. Smoke: insert one receipt + two lines, check unique constraint
# 4. Smoke: insert two receipts at same GP-FY with same receipt_no → should fail unique
# 5. Smoke: insert receipt with both payer_citizen_id=null and payer_name_freetext=null → should fail CHECK
# 6. Smoke: insert receipt with only payer_name_freetext set → should succeed (walk-in)
```

---

## What is NOT in Phase 14

- No service file
- No controller
- No routes
- No API endpoints
- No frontend
- No N05 cashbook table (that is Phase 18)

---

## Files to create / modify

| Action | File |
|--------|------|
| CREATE | `apps/grampanchayat-api/src/db/schema/receipt-sequences.ts` |
| CREATE | `apps/grampanchayat-api/src/db/schema/namuna10-receipts.ts` |
| CREATE | `apps/grampanchayat-api/src/db/schema/namuna10-receipt-lines.ts` |
| MODIFY | `apps/grampanchayat-api/src/db/schema/index.ts` — add 3 exports |
| CREATE | `apps/grampanchayat-api/drizzle/migrations/0007_n10_schema.sql` |
| MODIFY | `apps/grampanchayat-api/drizzle/migrations/meta/_journal.json` — add entry idx 7 |
