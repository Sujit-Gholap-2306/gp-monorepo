# Tax Chain Test Requirements — Phase 21 + 22

> **Audience**: AI agent (GPT/Claude) writing test cases.
> **Stack**: Vitest 4, Drizzle ORM, Postgres (Supabase direct).
> **Run**: `pnpm --filter @gp/grampanchayat-api test:invariants`
> **Setup**: DB must be seeded first via `pnpm --filter @gp/grampanchayat-api seed:demo`
> **File**: `tests/integration/tax-chain-invariants.test.ts`

---

## Context

Maharashtra GP tax chain flow:

```
N08 (assessment) → N09 (demand) → N10 (collection receipt)
                                         ↓
                                   N05 (cashbook)
                                         ↓
                                   N06 (classified monthly register)
```

Every invariant below must hold for **any seeded GP** after the demo seed runs.
Tests are **read-only assertions** — they never write to DB.

---

## Phase 22 — Demo Seed Contract

The seed script (`scripts/seed-demo-gp.ts`) must produce exactly:

| Entity | Count | Notes |
|--------|-------|-------|
| GP tenant | 1 | subdomain `test-gp`, `onboarding_complete = true` |
| Property type rates | 1 set | house/lighting/sanitation/water rates populated |
| Citizens | ≥ 10 | Marathi names, ward numbers assigned |
| Properties | ≥ 10 | linked to citizens, length/width set |
| N09 demands (headers) | ≥ 10 | current FY, all generated via service |
| N09 demand lines | ≥ 40 | exactly 4 per header (house/lighting/sanitation/water) |
| N10 receipts | ≥ 3 | at least 1 partial payment, 1 full payment, 1 voided |
| N05 entries | ≥ 1 per receipt | created in same tx as N10 |
| N10 voided receipt | exactly 1 | `is_void = true`, reversal entries in N05 |

Seed script must be **idempotent** — running twice must not duplicate data (use `ON CONFLICT DO NOTHING` or check before insert for the test GP tenant).

---

## Phase 21 — Invariant Test Specification

### Setup (beforeAll)

```ts
// Fetch the test GP seeded by seed-demo-gp.ts
const gp = await db.select().from(gpTenants).where(eq(gpTenants.subdomain, 'test-gp')).limit(1)
const gpId = gp[0].id
const fiscalYear = currentFiscalYear()  // import from src/lib/fiscal.ts
```

All tests use `gpId` and `fiscalYear` from the seeded GP.

---

### INV-1 — N08 ↔ N09 demand totals match

**What**: For each property, the N09 `current_paise` on each demand line equals what `tax-calc.ts` would compute for that property × rate combination. N09 was generated from N08 — the numbers must agree.

**Query approach**:
1. Fetch all properties for `gpId` with their rates (JOIN `gp_properties` + `gp_property_type_rates`)
2. For each property, compute expected tax using `calcPropertyTax()` (import from `src/lib/tax-calc.ts`)
3. Fetch actual N09 demand lines for those properties in `fiscalYear`
4. Assert: for every property, expected `houseTaxPaise` = `current_paise` on the `house` demand line (within ±1 paise for rounding)
5. Assert: for every property, expected `lightingPaise` = `current_paise` on `lighting` line
6. Same for `sanitation`, `water`

**Edge cases to test**:
- Property with override rates (non-null `lighting_tax_paise` on property row) — override must win over GP default
- Property with 0 area (length or width = 0) — `houseTaxPaise` must be 0
- Properties where rate master has `defaultLightingPaise = null` — must use 0 not throw

**Tolerance**: ±1 paise acceptable (HALF_UP rounding in `toPaise`).

---

### INV-2 — N09 no overpayment constraint

**What**: For every demand line, `paid_paise ≤ previous_paise + current_paise`. This is also a DB CHECK constraint, but the test confirms no row violates it at the data level.

**Query**:
```sql
SELECT COUNT(*)
FROM gp_namuna9_demand_lines dl
JOIN gp_namuna9_demands d ON d.id = dl.demand_id
WHERE d.gp_id = $gpId
  AND d.fiscal_year = $fiscalYear
  AND dl.paid_paise > dl.previous_paise + dl.current_paise
```

**Assert**: count = 0

**Additional assertions**:
- `paid_paise >= 0` for all lines
- `total_due_paise = previous_paise + current_paise - paid_paise` (generated column — verify it matches)
- `status` column correctly reflects: `paid_paise = 0 → 'pending'`, `paid_paise = total → 'paid'`, else `'partial'`

---

### INV-3 — 3-way tie: N10 = N05 net = N06 month total

**What**: For a given month, the total cash collected via N10 receipts must equal net N05 cashbook postings must equal N06 classified monthly total.

**Setup**: Pick the calendar month with the most N10 receipt activity from the seed.

**Leg 1 — N10 receipt total for month**:
```sql
SELECT SUM(t.total_paise) AS n10_total
FROM gp_namuna10_receipts r
JOIN gp_namuna10_receipt_totals t ON t.receipt_id = r.id
WHERE r.gp_id = $gpId
  AND r.fiscal_year = $fiscalYear
  AND DATE_TRUNC('month', r.paid_at AT TIME ZONE 'Asia/Kolkata') = $month_start
  AND r.is_void = false
```

**Leg 2 — N05 net for month** (credits minus debits, tax-head accounts only, non-void):
```sql
SELECT
  SUM(CASE WHEN entry_type = 'credit' THEN amount_paise ELSE -amount_paise END) AS n05_net
FROM gp_namuna05_cashbook_entries
WHERE gp_id = $gpId
  AND fiscal_year = $fiscalYear
  AND fy_month_no = $fyMonthNo
  AND account_head IN ('property_tax_house','property_tax_lighting','property_tax_sanitation','property_tax_water')
  AND source_type = 'namuna10'
```

**Leg 3 — N06 month total** (sum of all tax-head month totals):
```sql
SELECT SUM(month_total_paise) AS n06_total
FROM gp_namuna06_view
WHERE gp_id = $gpId
  AND fiscal_year = $fiscalYear
  AND fy_month_no = $fyMonthNo
  AND account_head IN ('property_tax_house','property_tax_lighting','property_tax_sanitation','property_tax_water')
```

**Assert**: `n10_total === n05_net === n06_total`

**Important**: Adjustment heads (discount, late_fee, notice_fee, other) are intentionally excluded from Leg 1 comparison — they affect cash flow but not the tax-head classified totals.

---

### INV-4 — N10 receipt math integrity

**What**: For every receipt, `total_paise = lines_total - discount + late_fee + notice_fee + other`. This must match the `gp_namuna10_receipt_totals` view.

**Query**:
```sql
SELECT
  r.id,
  r.discount_paise,
  r.late_fee_paise,
  r.notice_fee_paise,
  r.other_paise,
  SUM(rl.amount_paise) AS lines_total,
  t.total_paise AS view_total,
  SUM(rl.amount_paise) - r.discount_paise + r.late_fee_paise + r.notice_fee_paise + r.other_paise AS computed_total
FROM gp_namuna10_receipts r
JOIN gp_namuna10_receipt_lines rl ON rl.receipt_id = r.id
LEFT JOIN gp_namuna10_receipt_totals t ON t.receipt_id = r.id
WHERE r.gp_id = $gpId
  AND r.fiscal_year = $fiscalYear
GROUP BY r.id, r.discount_paise, r.late_fee_paise, r.notice_fee_paise, r.other_paise, t.total_paise
```

**Assert for each receipt**:
- `computed_total === view_total` (formula matches view)
- `lines_total > 0` (no zero-amount receipts)
- `computed_total > 0` (net receipt must be positive)
- `discount_paise >= 0`, `late_fee_paise >= 0`, `notice_fee_paise >= 0`, `other_paise >= 0`

**Additional**:
- Each receipt has exactly the demand line IDs it was created with (no orphan lines)
- Receipt number format: matches `^\d{4}-\d{2}/\d{6}$` (e.g. `2025-26/000001`)
- Receipt numbers are unique per GP per FY

---

### INV-5 — Void reversal posts on void date, not receipt date

**What**: When a receipt is voided, the N05 reversal entries must use `voided_at` date (not `paid_at`). The reversal must exactly cancel the original entries.

**Setup**: Find the voided receipt from the seed.

```sql
SELECT id, receipt_no, paid_at, voided_at, fiscal_year
FROM gp_namuna10_receipts
WHERE gp_id = $gpId AND is_void = true
LIMIT 1
```

**Assert 1 — reversal entries exist**:
```sql
SELECT COUNT(*) FROM gp_namuna05_cashbook_entries
WHERE source_id = $voidedReceiptId AND source_type = 'namuna10_void'
```
Count must be > 0.

**Assert 2 — reversal uses void date, not paid_at**:
All `namuna10_void` entries for this receipt must have `entry_date` = IST date of `voided_at`, not `paid_at`.

**Assert 3 — reversal entry types are mirror-opposite**:
- Original `namuna10` entries: tax heads are `credit`, discount is `debit`, fees are `credit`
- Void `namuna10_void` entries: tax heads are `debit`, discount is `credit`, fees are `debit`

**Assert 4 — reversal amounts match original**:
For each `account_head`, sum of `namuna10_void` amounts = sum of `namuna10` amounts for the same receipt.

**Assert 5 — N09 `paid_paise` reversed**:
After void, `paid_paise` on each demand line affected by the receipt must equal the value BEFORE the receipt minus the receipt's line amount. Net = 0 if only one payment was made and it was voided.

```sql
SELECT dl.paid_paise
FROM gp_namuna9_demand_lines dl
JOIN gp_namuna10_receipt_lines rl ON rl.demand_line_id = dl.id
WHERE rl.receipt_id = $voidedReceiptId
```
For a fully voided single-payment scenario: `paid_paise = 0`.

---

## Test File Structure

```ts
// tests/integration/tax-chain-invariants.test.ts

import { describe, it, expect, beforeAll } from 'vitest'
import { db, sql } from '../helpers/db.ts'
import { eq } from 'drizzle-orm'
import { gpTenants } from '../../src/db/schema/index.ts'
import { currentFiscalYear } from '../../src/lib/fiscal.ts'
import { calcPropertyTax } from '../../src/lib/tax-calc.ts'

let gpId: string
let fiscalYear: string

beforeAll(async () => {
  const [gp] = await db.select().from(gpTenants).where(eq(gpTenants.subdomain, 'test-gp')).limit(1)
  if (!gp) throw new Error('Demo GP not seeded. Run: pnpm seed:demo')
  gpId = gp.id
  fiscalYear = currentFiscalYear()
})

describe('INV-1: N08 ↔ N09 demand totals', () => { /* ... */ })
describe('INV-2: No N09 overpayment', () => { /* ... */ })
describe('INV-3: 3-way tie N10 = N05 = N06', () => { /* ... */ })
describe('INV-4: N10 receipt math', () => { /* ... */ })
describe('INV-5: Void reversal date + amounts', () => { /* ... */ })
```

---

## Backend Utility/Helper Coverage (BE)

These are required to keep tax-chain helper behavior stable while INV tests evolve.

- `tests/unit/account-heads.test.ts`
  - `TAX_HEAD_TO_ACCOUNT_HEAD` covers all canonical tax heads
  - account head and ledger code uniqueness checks
  - ledger code format check (`NNNN-NNN`)
- `tests/unit/spreadsheet.test.ts`
  - header normalization and empty-row skipping in XLSX parsing
  - parse error wrapping to `ApiError(400)` in `parseImportBuffer`
  - boundary checks for `assertRowCap` and `assertPropertyTypeRateRowCap` (`0`, `max`, `max+1`)

Execution snapshot:
- `pnpm --filter @gp/grampanchayat-api exec vitest run tests/unit`
- Latest run: `7 files`, `72 tests` passed

---

## Coverage Targets

| Module | Target | Why |
|--------|--------|-----|
| `src/lib/tax-calc.ts` | 90% | Core formula — every branch matters |
| `src/lib/fiscal.ts` | 90% | FY boundaries must be exact |
| `src/lib/money.ts` | 90% | Rounding correctness |
| `src/services/namuna10.service.ts` | 70% | Create + void paths |
| `src/services/namuna9.service.ts` | 60% | Generate path |
| `src/services/namuna56.service.ts` | 60% | Read paths |
| `src/controllers/**` | 50% | Input validation coverage |

Overall threshold configured in `vitest.config.ts`: lines/functions/statements ≥ 60%, branches ≥ 50%.

---

## Running Tests

```bash
# 1. Seed demo data
pnpm --filter @gp/grampanchayat-api seed:demo

# 2. Run invariants
pnpm --filter @gp/grampanchayat-api test:invariants

# 3. With coverage
pnpm --filter @gp/grampanchayat-api test:coverage

# 4. Watch mode during development
pnpm --filter @gp/grampanchayat-api test:invariants:watch
```

**Required env**: `DATABASE_URL` pointing to **direct** Postgres connection (port 5432, not pooler) — same as `drizzle-kit migrate`.

---

## Notes for Test Author

- Import DB helpers from `tests/helpers/db.ts` — not from `src/db/index.ts` directly
- Use `sql` tagged template for raw queries (Drizzle's `db.execute(sql`...`)`)
- All monetary assertions: use `Number()` coercion — Postgres `bigint` may arrive as string via postgres.js
- IST date conversion for `entry_date` assertions: add 5.5 hours to UTC timestamps before comparing date strings
- `gp_namuna10_receipt_totals` is a view — query it directly, don't compute in test
- Tolerance for INV-1 rounding: `Math.abs(expected - actual) <= 1`
