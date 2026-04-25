# GP Tax Chain — Implementation Plan (N08 → N09 → N10 → N05/N06)

> **Status**: Plan — ready to execute phase by phase.
> **Owner**: Engineering
> **Target**: Launch after 2026-04-26 for real GP onboarding.
> **Pre-req**: Masters (citizens, properties, property-type-rates) are done.

---

## 0. Context

Maharashtra Gram Panchayats maintain 33 physical "Namune" (registers) under the
Maharashtra Village Panchayats Act 1958 + Lekha Sanhita 2011. The **property-tax
chain** is the operational core of any GP and the primary demo flow:

```
N08 (Assessment)  →  N09 (Demand)  →  N10 (Collection)  →  N05 (Daily Cashbook) / N06 (Monthly Classified)
```

- **N08** — मालमत्ता कर आकारणी नोंदवही (Property Tax Assessment Register).
  Static register of every property and its computed annual tax.
- **N09** — मागणी नोंदवही (Demand Register). Yearly roll-up: "property X owes ₹Y
  this fiscal year, plus ₹Z arrears." Generated once per fiscal year from N08
  × rate master.
- **N10** — वसुली नोंदवही (Collection Register). Receipts issued when citizens
  pay. Every receipt decrements the matching N09 demand-line.
- **N05** — General Cash Book / दैनिक रोख नोंदवही. Daily, every cash and bank
  transaction. Auto-linked from N10 receipts at insert time.
- **N06** — Classified Receipt Register / वर्गीकृत जमा नोंदवही. **Monthly**,
  receipts grouped by account head (लेखशीर्ष). Compiled from N05 daily entries.

### Why this matters
- Gram Sevaks spend ~70 % of their day on N09 + N10.
- Demo **must** show the end-to-end chain working on real tenant data.
- Pre-production launch is post-2026-04-26 — the fiscal year has already
  started. Opening balances **must** be handled (see §3B2).

---

## 1. Current state

| Piece | State |
|---|---|
| Auth, tenant routing, tier gating | ✅ |
| Masters — citizens | ✅ API + bulk import |
| Masters — properties | ✅ API + bulk import |
| Masters — property-type-rates | ⚠️ API exists; needs `default_lighting_paise / default_sanitation_paise / default_water_paise` columns added in Phase 2 |
| Legacy N08 UI (IDB demo) | ⚠️ `app/(dashboard)/namuna8/` — not tenant-isolated |
| Legacy N09 demo ("demand" route) | ⚠️ `app/(dashboard)/demand/` — IDB only |
| N10, N05, N06 | ❌ Not built |

**Key gap**: the legacy N08/demand pages use IndexedDB. For tenant launch, we
must rebuild inside `[tenant]/(admin)/admin/*` reading from the API.

---

## 2. Architecture decisions

### 2.1 Authoritative storage: Postgres via Drizzle → grampanchayat-api
Rule (see `docs/architecture/grampanchayat-mutations.md`): **no new server
actions** for domain data, and **no** `supabase.from()` in the Next app for
domain tables (auth and `gp_tenants` only). All tax data flows via
grampanchayat-api.

Migrations and journal/baseline notes: `docs/MIGRATIONS.md`.

### 2.2 Tax calculation lives in the **backend service**, not frontend
Reasons:
- Same math used by N08 display, N09 generator, N10 receipt validation — one
  source of truth.
- Audit trail: back-end can log every calculation input.
- Prevents frontend drift.

### 2.3 Rate master semantics (`gp_property_type_rates`)
- Rates are stored **per sqft** in `numeric(12, 4)`.
- Legacy `lib/namuna8.ts` uses ₹/sqm. The new service will convert as needed
  (`sqm = sqft / 10.7639`).
- `min_rate` / `max_rate` are *state-mandated bounds* — validate that
  `land_rate_per_sqft`, `construction_rate_per_sqft`, etc. fall between them.

### 2.4 Fiscal year format: `'YYYY-YY'`
Example: `'2026-27'`. Indian FY starts April 1.
Helper function `currentFiscalYear(d = new Date())` in a shared `lib/fiscal.ts`
so every service computes it the same way.

### 2.5 All money in integer **paise** with HALF-UP rounding
- Store all money columns (`previous_paise`, `current_paise`, `paid_paise`,
  `amount_paise`, adjustment fields, etc.) as `bigint` paise.
- Convert to ₹ only at the presentation layer.
- **Rounding rule**: `toPaise(rupees)` = `Math.round(rupees * 100)` —
  HALF-UP, matches Excel and Balsane workbook outputs. Lives in `lib/money.ts`.
- All rounding happens at one boundary (rupee input → paise). Internal
  paise arithmetic is exact (integer).

### 2.6 Idempotent "generate" operations
- `POST /namuna9/generate?year=2026-27` must be safely re-runnable.
- Enforced via `UNIQUE(gp_id, property_id, fiscal_year)` constraint + `ON
  CONFLICT DO NOTHING` (or `DO UPDATE` where explicitly re-pricing).

### 2.7 Simplicity rules (locked)
These constraints exist to keep the system debuggable. Violations need an
explicit case in the PR description.

1. **No SQL triggers.** Use GENERATED columns (computed inline by Postgres
   on row write, not background) or compute on read via views.
2. **No background recompute jobs.** N06, running balance, totals — all
   are SQL views. If profile says they're slow at scale, materialise the
   views (with manual `REFRESH MATERIALIZED VIEW`); don't add cron jobs
   for v1.
3. **No denormalised caches that aren't enforced.** If a "subtotal" column
   could drift from its source, drop it and use a view.
4. **One source of truth per derived value.** `total_due_paise` is
   computed; `running_balance_paise` is computed; `month_total_paise` is
   computed. Compute once, in the view; never store and hope.
5. **Payment allocation is deterministic.** A receipt-line clears the
   matching demand-line's arrears first, then current. No per-line split
   fields, no clerk choice. Matches §129 MVP Act practice.

---

## 3. Phases

### Phase A — N08 (Assessment Register) on tenant admin

**Goal**: a real, tenant-isolated N08 that reads from the API and uses the
rate master.

**Schema**: no new tables. Uses existing `gp_properties`, `gp_citizens`,
`gp_property_type_rates`.

**Backend**:
- `src/lib/fiscal.ts` — `currentFiscalYear()`, `fiscalYearRange(yyyy_yy)`.
- `src/lib/tax-calc.ts` — pure function:
  ```ts
  calcPropertyTax({ property, rates, ageBracket, usageWeightage }): {
    areaSqFt, areaSqM,
    landValue, buildingValue, capitalValue,
    houseTax, diwabatti, arogya, panipatti,
    totalTax
  }
  ```
- `src/services/namuna8.service.ts` — list properties joined with citizens +
  computed tax.
- `src/controllers/namuna8.controller.ts`.
- Routes:
  - `GET  /:subdomain/namuna8` — list with query: `?ward=`, `?q=`,
    `?propertyType=`
  - `GET  /:subdomain/namuna8/:propertyId` — single row with full calc
    breakdown

**Frontend** (`apps/grampanchayat`):
- `lib/api/namuna8.ts` — API client functions.
- `app/[tenant]/(admin)/admin/namuna8/page.tsx` — list table with filters.
- `app/[tenant]/(admin)/admin/namuna8/[id]/page.tsx` — detail view with
  editable assessment (though typical use is read-only after assessment).
- `app/[tenant]/(admin)/admin/namuna8/print/page.tsx` — physical-register
  print view (A4 landscape, matches statutory N08 columns).
- Nav entry in `components/admin/sidebar.tsx` under **Pro** tier.

**Validation rules**:
- `property_type` must exist in rate master for the GP.
- Rate master must be complete before opening N08 (block with clear error:
  "Set rates for all property types first").

**Acceptance**:
- [ ] List shows all properties for the tenant with computed tax.
- [ ] Changing a rate in the master → N08 list reflects new numbers on
      refresh.
- [ ] Print view prints cleanly on A4.
- [ ] Tier gate works (free tier → upgrade screen).

---

### Phase B — N09 (Demand Register)

**Goal**: annual roll-up of N08 → actual payable demands, per property, per
fiscal year.

#### 3B.1 Schema — header + demand-lines

Real N09 in Balsane breaks every demand into 4 head rows × {previous, current,
total}. Schema mirrors that exactly.

Files:
- `apps/grampanchayat-api/src/db/schema/namuna9-demands.ts`
- `apps/grampanchayat-api/src/db/schema/namuna9-demand-lines.ts`

```ts
// Header — one row per (property × fiscal_year)
gp_namuna9_demands {
  id              uuid PK
  gp_id           uuid FK gp_tenants(id) ON DELETE CASCADE
  property_id     uuid FK gp_properties(id) ON DELETE RESTRICT
  fiscal_year     text          -- 'YYYY-YY', e.g. '2026-27'

  generated_at    timestamptz default now()
  generated_by    uuid          -- user id of Gram Sevak
  notes           text
  created_at, updated_at timestamptz
}
UNIQUE INDEX (gp_id, property_id, fiscal_year)
INDEX (gp_id, fiscal_year)
INDEX (gp_id, property_id)

// Lines — exactly 4 per header (one per canonical tax head)
gp_namuna9_demand_lines {
  id              uuid PK
  demand_id       uuid FK gp_namuna9_demands(id) ON DELETE CASCADE
  tax_head        text CHECK IN ('house','lighting','sanitation','water')

  previous_paise  bigint NOT NULL DEFAULT 0   -- मागील — arrears carried in
  current_paise   bigint NOT NULL DEFAULT 0   -- चालू  — this FY demand from N08
  paid_paise      bigint NOT NULL DEFAULT 0   -- running total of N10 receipt-lines

  total_due_paise bigint GENERATED ALWAYS AS
                    (previous_paise + current_paise - paid_paise) STORED
  status          text GENERATED ALWAYS AS (
                    CASE
                      WHEN previous_paise + current_paise = 0                 THEN 'paid'   -- nothing to pay
                      WHEN paid_paise = 0                                     THEN 'pending'
                      WHEN paid_paise >= previous_paise + current_paise       THEN 'paid'
                      ELSE 'partial'
                    END
                  ) STORED
  notes           text
  created_at, updated_at timestamptz

  CHECK (previous_paise >= 0 AND current_paise >= 0 AND paid_paise >= 0)
  CHECK (paid_paise <= previous_paise + current_paise)   -- no overpayment
}
UNIQUE INDEX (demand_id, tax_head)
INDEX (demand_id)
```

The two CHECKs together guarantee `total_due_paise >= 0` and `status` always
makes sense — no edge case slips through to the UI.

**Why no `is_opening_balance`**: opening balances no longer need their own
row. They feed `previous_paise` on a single current-FY header (see §3B2).

**Why generated columns**: `total_due_paise` and `status` are derived — one
source of truth, can be indexed, no drift across services.

**Header-level totals** (for list views) come via a SQL view:
```sql
CREATE VIEW gp_namuna9_demand_totals AS
SELECT
  d.id AS demand_id,
  SUM(l.previous_paise) AS previous_paise,
  SUM(l.current_paise)  AS current_paise,
  SUM(l.paid_paise)     AS paid_paise,
  SUM(l.total_due_paise) AS total_due_paise,
  -- status rolled up: paid only if all 4 lines paid; pending only if all 4 pending
  CASE
    WHEN SUM(l.paid_paise) = 0                                       THEN 'pending'
    WHEN SUM(l.paid_paise) >= SUM(l.previous_paise + l.current_paise) THEN 'paid'
    ELSE 'partial'
  END AS status
FROM gp_namuna9_demands d
JOIN gp_namuna9_demand_lines l ON l.demand_id = d.id
GROUP BY d.id;
```

#### 3B.2 API

Routes:
- `POST /:subdomain/namuna9/generate` — body: `{ fiscalYear: '2026-27' }`
  - Pre-condition: `gp_tenants.onboarding_complete = true`. Endpoint
    returns `409` if the GP hasn't completed onboarding (see §5).
  - For each property in tenant, in a single DB transaction:
    1. Compute per-head amounts via `calcPropertyTax({ property, rates })`
       → `{ houseTax, lighting, sanitation, water }` in paise.
    2. For each head, compute `previous_paise` (the **arrears carry-in
       rule**):
       - If a prior-FY demand-line exists for this `(property, head)`:
         `previous_paise = max(0, prior_line.total_due_paise)`.
       - Else (no prior FY at all): `previous_paise = 0`. The opening
         balance import (Phase B2) is the only way to seed historic
         arrears for a brand-new GP — generate does **not** invent them.
    3. Insert header `gp_namuna9_demands` with `ON CONFLICT (gp_id,
       property_id, fiscal_year) DO NOTHING`. Default = skip if exists.
       `?force=true` → `DO UPDATE SET updated_at = now()` AND replaces
       the 4 child lines (DELETE + INSERT inside the same tx).
    4. Insert exactly 4 `gp_namuna9_demand_lines` rows (one per
       `tax_head`) with `current_paise` from step 1, `previous_paise`
       from step 2, `paid_paise = 0`.
  - Return: `{ year, headersGenerated, headersSkipped, totalDemandPaise }`
- `GET  /:subdomain/namuna9?year=2026-27&ward=&status=` — list. Joins
  `gp_namuna9_demand_totals` view for header totals + per-head breakdown
  in the response.
- `GET  /:subdomain/namuna9/:id` — detail with all 4 lines + receipt history.
- `PATCH /:subdomain/namuna9/:id` — Gram Sevak can add/edit `notes` on the
  header.
- `POST  /:subdomain/namuna9/:id/lines/:lineId/waive` — body: `{ reason }`.
  **Waive contract**: sets `current_paise = 0`, appends `reason` to
  `notes`. **Forbidden if `paid_paise > 0`** (returns `409` — refunds
  are out of scope for v1; resolve via a separate refund flow if it
  ever becomes a need). `previous_paise` is never touched by waive —
  arrears waiver is a Sarpanch-resolution flow handled separately.

**Transaction safety**: the generate endpoint should run all inserts in a
single DB transaction so a partial failure doesn't leave half the village with
demands.

#### 3B.3 Frontend

- `lib/api/namuna9.ts`
- `app/[tenant]/(admin)/admin/namuna9/page.tsx` — year selector +
  **"Generate demand"** button (confirm modal) + list table
- `app/[tenant]/(admin)/admin/namuna9/[id]/page.tsx` — detail with receipt
  history (from N10)
- `app/[tenant]/(admin)/admin/namuna9/print/page.tsx` — physical N09 format

**Acceptance**:
- [ ] Clicking Generate for 2026-27 creates one header + 4 demand-lines per
      property (one per tax head).
- [ ] Clicking Generate again → no duplicates, count = 0 new rows.
- [ ] Each demand-line's `previous_paise` matches
      `max(0, prior_FY_same_head.total_due_paise)` — verified by INV-2.
- [ ] Filter by status (header roll-up via `gp_namuna9_demand_totals`) works.
- [ ] Waive endpoint refuses with 409 when the line has `paid_paise > 0`.
- [ ] Tier gate: **Pro**.

---

### Phase B2 — Opening balances (arrears migration)

**Why needed**: launching post-April 26 means every GP already has:
- Prior-year arrears (multi-year accumulation, maintained on paper)
- Current FY 2026-27 demand (likely already entered in physical N09 by GP)
- Possibly partial collections already done on paper since April 1

If we go live without this data, every property shows ₹0 owed → wrong.

#### 3B2.1 Workflow

Single-use, part of onboarding checklist:

1. Before go-live, Gram Sevak downloads an **Opening Balance Template** (XLSX).
2. Fills per property — **one row per (property, head)**. Single shape only
   (no wide variant — keeps validation predictable).

   | property_no | tax_head    | arrears_prior_years_₹ | current_year_demand_₹ | current_year_paid_₹ |
   |-------------|-------------|-----------------------|-----------------------|---------------------|
   | P-123       | house       | 600.00                | 918.00                | 500.00              |
   | P-123       | lighting    | 0                     | 25.00                 | 0                   |
   | P-123       | sanitation  | 0                     | 25.00                 | 0                   |
   | P-123       | water       | 0                     | 360.00                | 0                   |

   Rules:
   - Properties not on water/lighting/sanitation just get `0` in those rows.
   - Up to 2 decimal places of rupees; backend converts via `toPaise(₹)`
     (HALF-UP rounding per §2.5). More than 2 decimals → row rejected
     with a clear error.
   - `tax_head` must be one of the 4 canonical values; template includes
     a `heads` sheet with a data-validation list so users can't typo.
   - **Every property must have exactly 4 rows** (all 4 heads).
3. Uploads via admin UI.
4. Backend (single DB transaction):
   - For each `(property_no)` group of 4 rows:
     - Insert one `gp_namuna9_demands` header for the **current** FY
       (`ON CONFLICT … DO NOTHING` — opening import must run before
       `generate`).
     - Insert 4 `gp_namuna9_demand_lines` rows with:
       - `previous_paise = toPaise(arrears_prior_years_₹)`
       - `current_paise  = toPaise(current_year_demand_₹)` — the GP's
         number wins for first-FY only; subsequent FYs use the rate
         master via `generate`.
       - `paid_paise     = toPaise(current_year_paid_₹)`
   - Stamps `gp_tenants.opening_balance_imported_at = now()`. Does NOT
     flip `onboarding_complete` — that is set by the onboarding-flow UI
     after every checklist step is green (see §5). Single source of truth.
   - Returns row-level errors on validation failure; nothing is committed
     unless every row is valid.

**No separate `fiscal_year = 'opening'` row.** Arrears live as
`previous_paise` on the current FY's demand-lines. This matches Balsane's
N09 layout exactly (`मागील` column on the same row as `चालू`).

#### 3B2.2 Schema additions

```ts
gp_tenants {
  ...existing
  onboarding_complete boolean default false
  opening_balance_imported_at timestamptz
}
```

#### 3B2.3 API

- `GET  /:subdomain/namuna9/opening-template` — returns XLSX template
  with `heads` validation sheet
- `POST /:subdomain/namuna9/opening-balances` — multipart upload
  - Validates: every `property_no` exists, every property has exactly 4
    rows (one per canonical head), all amounts ≥ 0, ≤ 2 decimal places
  - Runs in single transaction; returns row-level errors on failure
- After successful run, sets `gp_tenants.opening_balance_imported_at = now()`.
  The `onboarding_complete` flag is set by the onboarding flow UI (§5),
  not here.

#### 3B2.4 Frontend

- `app/[tenant]/(admin)/admin/onboarding/page.tsx` — guided checklist:
  1. Rate master set
  2. Citizens imported
  3. Properties imported
  4. **Opening balances imported** ← new
  5. Ready to generate N09
- `components/admin/opening-balance-import.tsx` — same pattern as
  `masters-bulk-import.tsx`

**Acceptance**:
- [ ] Template download works; head validation list present.
- [ ] Invalid rows rejected with clear per-row errors (missing head, > 2
      decimals, unknown property_no, < 4 rows for a property).
- [ ] Successful import: 1 demand header + 4 demand-lines per property,
      with correct `previous_paise + current_paise + paid_paise`.
- [ ] N09 list after import shows correct मागील + चालू per head.
- [ ] `gp_tenants.opening_balance_imported_at` is set; INV-2 holds.
- [ ] Generate endpoint returns 409 while `onboarding_complete = false`.

---

### Phase C — N10 (Collection Register)

**Goal**: record tax receipts; every receipt decrements the corresponding N09
row. This is where Gram Sevaks spend most of their day.

#### 3C.1 Schema — receipts + lines + sequence (kept lean)

Three tables. Receipts have lines because one payment commonly covers
multiple heads. Adjustments (discount / late fee / notice fee / misc) live
on the receipt header. **No denormalised totals are stored** — totals
come from a view (§3C.4). **No payment-split fields** — allocation is
deterministic (arrears first, see §2.7 rule 5).

Files:
- `apps/grampanchayat-api/src/db/schema/namuna10-receipts.ts`
- `apps/grampanchayat-api/src/db/schema/namuna10-receipt-lines.ts`
- `apps/grampanchayat-api/src/db/schema/receipt-sequences.ts`

```ts
// Receipt header — one per payment event
gp_namuna10_receipts {
  id                uuid PK
  gp_id             uuid FK gp_tenants(id) ON DELETE CASCADE
  property_id       uuid FK gp_properties(id) ON DELETE RESTRICT

  -- Payer: usually a known citizen (owner / family member). For walk-in
  -- relatives or proxies we don't have on file, leave the FK NULL and
  -- capture a free-text name. Exactly one of the two must be set.
  payer_citizen_id  uuid NULL FK gp_citizens(id) ON DELETE RESTRICT
  payer_name_freetext text NULL
  CHECK ((payer_citizen_id IS NOT NULL) OR (payer_name_freetext IS NOT NULL))

  fiscal_year       text NOT NULL    -- 'YYYY-YY' of paid_at
  receipt_no        text NOT NULL    -- '2026-27/000142' (allocated at insert)

  paid_at           timestamptz NOT NULL
  payment_mode      text NOT NULL CHECK IN ('cash','upi','cheque','neft','other')
  reference         text             -- cheque no / UPI txn id / NEFT UTR

  -- Bill-time adjustments (Balsane बिल rows 17-20). ALL stored as paise
  -- via toPaise() — never floats.
  discount_paise    bigint NOT NULL DEFAULT 0 CHECK (discount_paise   >= 0)  -- ५% सूट
  late_fee_paise    bigint NOT NULL DEFAULT 0 CHECK (late_fee_paise   >= 0)  -- ५% लेट फी
  notice_fee_paise  bigint NOT NULL DEFAULT 0 CHECK (notice_fee_paise >= 0)  -- नोटीस फी
  other_paise       bigint NOT NULL DEFAULT 0 CHECK (other_paise      >= 0)  -- इतर
  other_reason      text

  is_void           boolean NOT NULL DEFAULT false
  voided_at         timestamptz
  voided_by         uuid
  void_reason       text

  created_by        uuid NOT NULL
  created_at, updated_at timestamptz
}
UNIQUE INDEX (gp_id, receipt_no)   -- per-GP uniqueness across all FYs
INDEX (gp_id, fiscal_year, paid_at)
INDEX (gp_id, property_id, paid_at)

// Receipt lines — one row per (receipt × demand-line).
// Tax head is determined by JOIN to demand_line; never duplicated here.
gp_namuna10_receipt_lines {
  id              uuid PK
  receipt_id      uuid FK gp_namuna10_receipts(id) ON DELETE CASCADE
  demand_line_id  uuid FK gp_namuna9_demand_lines(id) ON DELETE RESTRICT
  amount_paise    bigint NOT NULL CHECK (amount_paise > 0)
  created_at      timestamptz
}
UNIQUE INDEX (receipt_id, demand_line_id)   -- one demand-line per receipt
INDEX (demand_line_id)

// Sequence table — drives receipt_no, locked per (gp, fiscal_year)
gp_receipt_sequences {
  gp_id        uuid    NOT NULL,
  fiscal_year  text    NOT NULL,
  next_no      bigint  NOT NULL DEFAULT 1,
  updated_at   timestamptz,
  PRIMARY KEY (gp_id, fiscal_year)
}
```

**What's deliberately missing**:

| Removed | Why |
|---------|-----|
| `lines_total_paise` on header | Denormalised, no enforcement → drift hazard. Use the view (§3C.4) instead. |
| `total_paise GENERATED` on header | Depends on lines, can't be GENERATED at row level. Use the view. |
| `tax_head` on receipt_line | Already on `demand_line` — duplication = drift. JOIN when reading. |
| `applied_to_previous_paise` / `applied_to_current_paise` | Deterministic allocation rule (arrears first) — no need to record the split per row. Computed on read for बिल display. |

#### 3C.2 Receipt number sequencing — locked

**Format**: `'<FY>/<NNNNNN>'` — e.g. `'2026-27/000142'`. Six-digit zero-padded
within FY. (Resolves §10 Open Q #1.)

**Concurrency**: inside the receipt-create transaction, run

```sql
INSERT INTO gp_receipt_sequences (gp_id, fiscal_year, next_no)
VALUES ($gp, $fy, 2)
ON CONFLICT (gp_id, fiscal_year) DO UPDATE
  SET next_no = gp_receipt_sequences.next_no + 1,
      updated_at = now()
RETURNING next_no - 1 AS allocated;
```

This gets a row lock on the (gp, fy) row inside the same transaction as the
receipt insert. Two concurrent counter clerks at the same GP cannot collide.

**Voided receipts keep their number** — gaps are not reused. Audit-friendly.

#### 3C.3 Business rules — single transaction per receipt

Every receipt create runs in **one DB transaction** that does, in order:

1. **Allocate receipt number** via the row-locked upsert in §3C.2.
2. **For each requested line, validate**:
   - `amount_paise > 0`.
   - `demand_line` exists and belongs to the same GP and property.
   - Read `demand_line` with `SELECT … FOR UPDATE` (locks it for the
     remainder of the tx — prevents two concurrent receipts from each
     reading the same `total_due_paise` and double-paying).
   - `amount_paise ≤ demand_line.total_due_paise`.
3. **Insert** `gp_namuna10_receipts` header (no totals — those are read
   from the view).
4. **Insert** N `gp_namuna10_receipt_lines`.
5. **Update** each affected `gp_namuna9_demand_lines.paid_paise +=
   line.amount_paise`. `total_due_paise` and `status` are GENERATED;
   they recompute on the row update — no extra step.
6. **Insert** N05 cashbook entries (Phase D §3D.2). N06 is a view, so
   nothing else to write.

Any failure → full rollback, no row written.

#### 3C.4 Read-side views — totals, arrears split, receipt list

The header doesn't store totals. Reads come from views:

```sql
-- Per-receipt totals (used by list, detail, print)
CREATE VIEW gp_namuna10_receipt_totals AS
SELECT
  r.id AS receipt_id,
  COALESCE(SUM(rl.amount_paise), 0)                                         AS lines_total_paise,
  (COALESCE(SUM(rl.amount_paise), 0)
    - r.discount_paise + r.late_fee_paise + r.notice_fee_paise + r.other_paise) AS total_paise
FROM gp_namuna10_receipts r
LEFT JOIN gp_namuna10_receipt_lines rl ON rl.receipt_id = r.id
GROUP BY r.id;

-- Per-demand-line arrears/current outstanding split, for बिल display.
-- "arrears first" allocation is computed deterministically.
CREATE VIEW gp_namuna9_demand_line_split AS
SELECT
  dl.id AS demand_line_id,
  dl.previous_paise,
  dl.current_paise,
  dl.paid_paise,
  GREATEST(0, dl.previous_paise - dl.paid_paise)                                  AS arrears_outstanding_paise,
  GREATEST(0, dl.current_paise - GREATEST(0, dl.paid_paise - dl.previous_paise))  AS current_outstanding_paise
FROM gp_namuna9_demand_lines dl;
```

Both views are pure SQL — no triggers, no recompute. They re-evaluate
on every query.

#### 3C.5 FY attribution rule (resolves §10 Open Q #3)

Receipt's `fiscal_year` = FY of `paid_at`, not FY of the demand it pays.
A 2025-26 arrear paid on 2026-04-15 attributes to **2026-27** for N05/N06
classification. The demand-line it clears can still belong to a 2025-26
header — that's how arrears recovery works on paper too.

#### 3C.6 Void

Void is never a delete. Set `is_void = true`, `voided_at`, `voided_by`,
`void_reason`. Same transaction:

- Decrement each affected `demand_line.paid_paise` by the original line
  amount (`paid_paise` re-locked with `FOR UPDATE` first to avoid races).
- Insert reversal N05 cashbook entries on `voided_at::date` (NOT
  back-dated to original `paid_at`).

N06 is a view → nothing else to recompute. The view simply reflects the
new N05 state on the next query.

Receipt number stays allocated — gaps in the sequence are an audit signal,
not a bug.

#### 3C.7 API

```http
POST /:subdomain/namuna10
{
  property_id,
  payer_citizen_id?,        // exactly one of these two
  payer_name_freetext?,     //   must be present
  paid_at,
  payment_mode,
  reference?,
  lines: [
    { demand_line_id, amount_paise }
  ],
  discount_paise?, late_fee_paise?, notice_fee_paise?,
  other_paise?, other_reason?
}
→ 201 { receipt, lines, totals }  // totals from the view
```

- `GET  /:subdomain/namuna10?from=&to=&property_id=&mode=&fiscal_year=` —
  lists receipts joined with `gp_namuna10_receipt_totals` for `total_paise`.
- `GET  /:subdomain/namuna10/:id` — detail with all lines, totals from view,
  per-line head label (joined from `demand_line.tax_head`).
- `POST /:subdomain/namuna10/:id/void` — body: `{ reason }`. Role-gated
  (see §10 Q #2).

#### 3C.8 Frontend

- `lib/api/namuna10.ts`
- `app/[tenant]/(admin)/admin/namuna10/page.tsx` — collection desk:
  - Search by property / owner / receipt no.
  - Selecting a property loads its 4 demand-lines for the FY (joined with
    `gp_namuna9_demand_line_split`) → form shows one row per head with
    `मागील outstanding`, `चालू outstanding`, `भरलेले`, and an editable
    "amount to pay this time" cell.
  - Counter clerk types one amount per head. **No per-line split UI** —
    allocation is deterministic (arrears first, then current).
  - 4 adjustment fields (discount, late fee, notice fee, other) below the
    head grid — matches Balsane `बिल` rows 17–20.
  - **Walk-in payer**: if no matching citizen is selected, a "different
    payer (free text)" field captures the name; `payer_citizen_id` stays null.
  - On submit → inline receipt print.
- `app/[tenant]/(admin)/admin/namuna10/[id]/print/page.tsx` — पावती print
  (thermal 80 mm + A5) showing 4 head rows (with arrears/current split read
  from the split view) + adjustments + total (from totals view).
- `components/admin/receipt-form.tsx`
- Quick-entry keyboard flow (Enter = save & print, Tab flow optimised).

**Acceptance**:
- [ ] Receipt against pending demand → each affected demand-line moves to
      `partial` or `paid` (computed by GENERATED column on update).
- [ ] CHECK rejects `amount_paise > demand_line.total_due_paise` (read with
      `FOR UPDATE` so concurrent inserts can't both pass the check).
- [ ] Walk-in payer flow: receipt with `payer_citizen_id = null` and
      `payer_name_freetext` set is accepted; CHECK forbids both null.
- [ ] Adjustments (discount/late/notice/other) round-trip on the print view
      (sourced from `gp_namuna10_receipt_totals` view).
- [ ] Void → each affected demand-line's `paid_paise` decreases by the
      original amount; status recomputes; reversal N05 entries posted on
      `voided_at::date`, not back-dated.
- [ ] Receipt-no sequence: 100 concurrent inserts at same GP-FY → no
      duplicates, no gaps (verified by integration test).

---

### Phase D — N05 (daily cashbook) table + N06 (monthly classified) view

**Identities (fixed from earlier reversal)**:
- **N05 = General Cash Book** — daily, every cash/bank txn. The
  authoritative source-of-truth book.
- **N06 = Classified Receipt Register** — monthly, receipts grouped by
  account head (लेखशीर्ष). **Implemented as a SQL view** computed from
  N05; no separate table to keep in sync.

Both auto-link from N10 in the same transaction (only N05 is *written*;
N06 is read on demand from the view).

#### 3D.1 N05 schema — single source of truth

```ts
// Postgres enum — typed at DB level, no JOIN to lookup
CREATE TYPE gp_account_head AS ENUM (
  'property_tax_house',         -- घरपट्टी कर
  'property_tax_lighting',      -- दिवाबत्ती कर
  'property_tax_sanitation',    -- आरोग्य कर / सफाईपट्टी
  'property_tax_water',         -- पाणीपट्टी कर
  'discount',                   -- ५% सूट
  'late_fee',                   -- ५% लेट फी
  'notice_fee',                 -- नोटीस फी
  'other'                       -- इतर
);

// N05 — daily cashbook entries
gp_namuna05_cashbook_entries {
  id              uuid PK
  gp_id           uuid FK gp_tenants(id) ON DELETE CASCADE
  entry_date      date NOT NULL          -- calendar date (paid_at::date)
  fiscal_year     text NOT NULL          -- 'YYYY-YY' of entry_date
  fy_month_no     smallint NOT NULL      -- 1=Apr … 12=Mar; computed at insert via fyMonthNo()

  entry_type      text NOT NULL CHECK IN ('credit','debit')
  account_head    gp_account_head NOT NULL
  description     text

  amount_paise    bigint NOT NULL CHECK (amount_paise > 0)

  source_type     text NOT NULL CHECK IN ('namuna10','namuna10_void','manual')
  source_id       uuid                   -- → gp_namuna10_receipts.id (when source_type='namuna10*')
  source_line_id  uuid                   -- → gp_namuna10_receipt_lines.id (per-head rows only)

  created_by      uuid NOT NULL
  created_at      timestamptz
}
INDEX (gp_id, entry_date, id)            -- supports running-balance window scan
INDEX (gp_id, fiscal_year, fy_month_no, account_head)  -- supports N06 view
INDEX (source_type, source_id)           -- supports void-reverse lookup
```

**Ledger codes** for printable returns (e.g. Balsane `0035-101`) are a
constant map keyed by `account_head`, defined in
`apps/grampanchayat-api/src/lib/account-heads.ts`. Not a column, not a
table — just a code constant. If a future GP needs custom codes, add a
master table then.

**No `running_balance_paise` stored.** It's a window function in the view
(§3D.3) — concurrency-safe by construction.

#### 3D.2 Wiring — only N05 writes, all in the receipt tx

Inside the receipt-create txn, after step 5 of §3C.3:

6a. For each receipt-line, insert one N05 row:
    ```
    entry_type    = 'credit'
    entry_date    = paid_at::date
    fy_month_no   = fyMonthNo(paid_at::date)
    account_head  = headToAccount(demand_line.tax_head)
    amount_paise  = receipt_line.amount_paise
    source_type   = 'namuna10'
    source_id     = receipt.id
    source_line_id= receipt_line.id
    ```
6b. For each non-zero adjustment field on the receipt header, insert one
    N05 row each:
    | Field | entry_type | account_head |
    |-------|-----------|--------------|
    | discount_paise | `debit` | `discount` |
    | late_fee_paise | `credit` | `late_fee` |
    | notice_fee_paise | `credit` | `notice_fee` |
    | other_paise | `credit` | `other` |

That's it. N06 is a view — no further writes.

**Void path**: insert mirror rows with `entry_type` reversed and
`source_type='namuna10_void'`, posted on `voided_at::date` (NOT
back-dated). The view automatically reflects the new state on the next
read — no recompute job, no triggers.

> **Note for paper-parity** — Balsane's paper N05 shows the *net* receipt,
> not gross + a separate discount line. Our N05 is more granular for audit
> richness. The N05 print view (§3D.3) collapses adjustments back into the
> receipt row when rendering the physical-register layout, so the printed
> page still matches paper while the underlying data preserves the trail.

#### 3D.3 N06 view + N05 running-balance view + APIs/UIs

```sql
-- N05 with running balance — concurrency-safe, no stored state
CREATE VIEW gp_namuna05_view AS
SELECT
  e.*,
  SUM(CASE WHEN e.entry_type='credit' THEN e.amount_paise ELSE -e.amount_paise END)
    OVER (PARTITION BY e.gp_id ORDER BY e.entry_date, e.id) AS running_balance_paise
FROM gp_namuna05_cashbook_entries e;

-- N06 (Classified Receipt Register) — pure aggregation over N05.
-- One row per (gp, fiscal_year, fy_month_no, account_head).
-- daily_totals_paise is jsonb keyed by day-of-month for the print layout.
CREATE VIEW gp_namuna06_view AS
WITH daily AS (
  SELECT
    gp_id, fiscal_year, fy_month_no, account_head,
    EXTRACT(DAY FROM entry_date)::int AS day_of_month,
    SUM(CASE WHEN entry_type='credit' THEN amount_paise ELSE -amount_paise END) AS day_total
  FROM gp_namuna05_cashbook_entries
  GROUP BY gp_id, fiscal_year, fy_month_no, account_head, EXTRACT(DAY FROM entry_date)
)
SELECT
  gp_id, fiscal_year, fy_month_no, account_head,
  jsonb_object_agg(day_of_month::text, day_total) FILTER (WHERE day_total <> 0) AS daily_totals_paise,
  SUM(day_total)                                                                AS month_total_paise,
  SUM(SUM(day_total)) OVER (
    PARTITION BY gp_id, fiscal_year, account_head
    ORDER BY fy_month_no
  )                                                                              AS fy_running_paise
FROM daily
GROUP BY gp_id, fiscal_year, fy_month_no, account_head;
```

**APIs / UIs**:
- `GET /:subdomain/namuna5?from=&to=&head=` — selects from `gp_namuna05_view`.
- `GET /:subdomain/namuna6?fiscal_year=&month=` — selects from `gp_namuna06_view`.
- `app/[tenant]/(admin)/admin/namuna5/page.tsx` — daily cashbook list with
  running balance (read straight from the view).
- `app/[tenant]/(admin)/admin/namuna6/page.tsx` — monthly classified
  register, one row per `account_head`, 31 day-columns + month total +
  FY running (matches Balsane `April` sheet layout).

**Acceptance**:
- [ ] N10 receipt → 1 N05 row per receipt-line + 1 per non-zero adjustment.
      No N06 writes (view-based).
- [ ] N06 view returns the right day cells for the receipt's month
      (verified: `daily_totals_paise → '{day}' = expected_paise`).
- [ ] Voiding N10 → reversing N05 rows on `voided_at::date`, not
      back-dated; N06 view immediately reflects the change without a
      recompute step.
- [ ] N05 view's `running_balance_paise` is correct under concurrent
      receipt inserts (load-test: 100 parallel inserts → balance still
      monotonic when read in entry order).
- [ ] **INV-3** holds:
      ```
      sum(gp_namuna10_receipt_totals.total_paise for month)
      = sum(N05 credits − N05 debits for month)
      = sum(N06 view month_total_paise for month)
      ```
      (note: all three are derived; the equality is structural.)

---

## 4. Tax calculation reference

Source-of-truth formulas, verified against Balsane workbook
(`docs/references/balsane-…xlsx` → `नमुना ८` rows 10–12 cell formulas).
To be implemented in `grampanchayat-api/src/lib/tax-calc.ts`:

```
areaSqFt         = length_ft * width_ft
areaSqM          = areaSqFt / 10.7639              -- workbook col 12: =K/10.764

landValue        = areaSqM * landRatePerSqM         -- per-sqm
                 = areaSqFt * landRatePerSqFt       -- OR per-sqft
buildingValue    = areaSqM * constructionRatePerSqM
                   * depreciationFactor(ageBracket)
                   * usageWeightage(propertyUsage)

capitalValue     = landValue + buildingValue

-- Only ONE head is derived. Workbook col 20: =IFERROR(R*S/1000,"")
-- where R = capital_value (col 18), S = tax_rate_paise (col 19).
houseTax         = capitalValue * taxRatePaise / 1000

-- The other 3 heads are flat per-property values, NOT computed.
-- Workbook cols 21–23 are literal numbers (e.g. 25, 25, 360 for row 10).
-- Lookup order: property override → GP rate-master default → 0.
lighting         = property.lighting_tax_paise
                   ?? rateMaster.default_lighting_paise
                   ?? 0
sanitation       = property.sanitation_tax_paise
                   ?? rateMaster.default_sanitation_paise
                   ?? 0
water            = property.water_tax_paise
                   ?? rateMaster.default_water_paise
                   ?? 0

-- Workbook col 24: =IFERROR(T+U+V+W,"")  — all 4 heads summed.
totalTax         = houseTax + lighting + sanitation + water
```

> **Divisor is `/1000`, not `/100`** — `taxRatePaise` is in paise, and
> `capitalValue` is in rupees. Paise/100 → rupees fraction; rupees ×
> rupees-fraction would double-multiply. Confirmed from Balsane: row 12
> property has capitalValue ₹1,94,866.22 and rate 0.7 paise → houseTax =
> 194866.22 × 0.7 / 1000 = ₹136.4063… → **HALF-UP to ₹136.41** (per §2.5)
> = **13641 paise** stored. ✓ matches workbook col 20.

**Rounding boundary**: rupees → paise via `lib/money.ts:toPaise()` exactly
once, at every input edge (calc results, XLSX import, API request bodies).
After that, all arithmetic is integer-paise. Never round mid-pipeline.

**FY month numbering**: `fyMonthNo(date)` lives in `lib/fiscal.ts` —
returns `1=Apr … 12=Mar`. Computed as
`((EXTRACT(MONTH FROM d) - 4 + 12) % 12) + 1`. Used by N05 inserts and
the N06 view.

**Depreciation table** (from Rule 32, Maharashtra VP Rules):
```
age_bracket  | factor
0-2          | 1.00
2-5          | 0.95
5-10         | 0.90
10-20        | 0.80
20-30        | 0.70
30-40        | 0.60
40-50        | 0.50
50-60        | 0.40
60+          | 0.30
```

**Usage weightage** (default 1.00 for residential):
```
residential  | 1.00
commercial   | 1.50  -- adjust per local GP policy
industrial   | 2.00
```

These tables should live as constants in `tax-calc.ts` with a TODO to make
them GP-configurable in a later phase if Gram Sevaks need per-GP overrides.

---

## 5. Pre-launch onboarding checklist (per GP)

Shown as the `[tenant]/(admin)/admin/onboarding/page.tsx` workflow:

| # | Step | Source-of-truth flag |
|---|------|----------------------|
| 1 | Set GP profile (name, logo, contact) — in Settings | `gp_tenants.profile_complete_at` |
| 2 | Rate master — all property types have land + construction + new rates **and the 3 default flat amounts** (lighting / sanitation / water) | computed: every `gp_property_type_rates` row has all 7 fields non-null |
| 3 | Citizens master imported (XLSX) | `count(gp_citizens) > 0` |
| 4 | Properties master imported (XLSX) | `count(gp_properties) > 0` |
| 5 | **Opening balances imported** (XLSX — prior arrears + current FY state) | `gp_tenants.opening_balance_imported_at IS NOT NULL` |
| 6 | Admin users added (at least Gram Sevak) | `count(users WHERE role='gram_sevak' AND gp_id=…) > 0` |

Once all 6 are green, the user clicks **"Mark GP as ready"** which sets
`gp_tenants.onboarding_complete = true`. **This UI is the only place
that flips that flag.** Other phases (opening import, admin invite, etc.)
write their own readiness timestamps but never touch
`onboarding_complete`. Single writer = no drift.

The N09 `generate` endpoint refuses with HTTP 409 while the flag is false.

---

## 6. Execution order

Recommended (smallest → biggest, each shippable):

1. **A** — N08 on tenant admin (no new tables; validates API chain for tax
   data end-to-end).
2. **B.1** — N09 schema + generate endpoint + list UI (current FY only, no
   arrears yet).
3. **B2** — Opening balances import: writes `previous_paise` directly on the
   current-FY demand-lines (single header per property, no separate
   `'opening'` row). Subsequent FYs derive `previous_paise` from prior-FY
   line `total_due_paise`.
4. **C** — N10 (this is what the Gram Sevak actually demos).
5. **D** — N05/N06 auto-link (read-only; closes the loop and is the demo
   "wow" moment).

**Do NOT** parallelise A → B → C; each depends on the previous for its data
shape. B2 can be done in parallel with C if two devs.

---

## 7. Testing — minimum before launch

- [ ] Unit: `calcPropertyTax` against 20 seeded properties, golden-master the
      outputs.
- [ ] Integration: generate N09 for a 500-property test GP; re-run; assert 0
      duplicates.
- [ ] Integration: full chain — generate N09 → collect partial N10 → assert
      N09 status = 'partial' → complete payment → status = 'paid' → N05/N06
      rows exist and balance.
- [ ] Opening balance import: happy path + bad XLSX rejection.
- [ ] RLS: with anon key, no tax table is readable (confirms API-only access).
- [ ] Print: N08, N09, N10 all print-preview cleanly on A4 / A5.

---

## 8. Out of scope (post-launch)

- Per-GP overrides for depreciation / usage weightage
- Multi-year bulk regeneration with rate versioning
- SMS reminders on pending demands
- UPI direct-integration (current: record txn_id only)
- N10 → bank reconciliation flow
- Other 29 Namune beyond the tax chain
- Per-user audit log UI (data is captured, reporting is post-launch)

---

## 9. Files to reference while building

| Pattern | File |
|---|---|
| Drizzle schema style | `apps/grampanchayat-api/src/db/schema/citizens.ts` |
| Service with zod + drizzle | `apps/grampanchayat-api/src/services/property-type-rates.service.ts` |
| Controller + BaseController | `apps/grampanchayat-api/src/controllers/property-type-rates.controller.ts` |
| Route registration | `apps/grampanchayat-api/src/routes/tenant.routes.ts` |
| Bulk import backend | `apps/grampanchayat-api/src/services/masters-bulk.service.ts` |
| Bulk import UI | `apps/grampanchayat/components/admin/masters-bulk-import.tsx` |
| API client helper | `apps/grampanchayat/lib/masters-bulk-api.ts` |
| Tenant admin page layout | `apps/grampanchayat/app/[tenant]/(admin)/layout.tsx` |
| Tier gating | `apps/grampanchayat/lib/tiers.ts` |
| Legacy N08 calc (to port) | `apps/grampanchayat/lib/namuna8.ts` |
| Legacy demand demo | `apps/grampanchayat/app/(dashboard)/demand/page.tsx` |

---

## 10. Open questions

1. ~~Receipt number format~~ — **Resolved**: per-FY 6-digit sequence
   `'YYYY-YY/NNNNNN'` backed by `gp_receipt_sequences` table with row-level
   lock. See §3C.2.
2. Who can void a receipt? Any admin, or only senior Gram Sevak role?
   (Affects role-check in controller.) — **Open**, decide before Phase C ships.
3. ~~Cross-FY arrear payment attribution~~ — **Resolved**: receipt
   `fiscal_year` follows `paid_at`, not demand's FY. The demand-line cleared
   may be older. See §3C.4.
4. ~~Who owns depreciation / usage weightage values~~ — **Resolved**:
   v1 ships state defaults hard-coded as constants in `tax-calc.ts`.
   Per-GP override deferred to D4 (§12.2) — pulled in only if a GP
   actually files a complaint about the default.
5. When the legacy `(dashboard)` demo routes get removed — before launch or
   kept for sales demos?
6. **§129 demand-notice issuance flow** — automated dispatch when a
   demand-line crosses the due-date threshold. Captured as deferred D2 in
   §12.2; nail down trigger date / template / channel before pulling it in.

---

## 11. Reference workbook & domain gap log

> Added 2026-04-25 after a domain-review pass against a real GP workbook.
> Every gap below was confirmed by inspecting cells/formulas in the
> reference file.
>
> **Status**: every gap A–I has been **back-propagated into §3 and §4**
> (the canonical phase definitions). This section is preserved as the
> audit trail of *why* the design changed; engineers building should
> follow §3 and §4, not this section.

### 11.1 Reference: Balsane GP workbook

Real working accounting workbook from **Balsane Gram Panchayat, Taluka
Sakri, District Dhule** — checked into the repo for engineering reference:

```
docs/references/balsane-gp-namuna-8-9-reference.xlsx
```

**45 sheets** covering N08 (831 rows of real properties), N09, उतारा, बिल,
नोटीस, monthly N06 tabs (April–March), expenditure side (P-April–P-March),
वसुली रिपोर्ट, and rate masters. **Use this as the schema/UX
ground-truth instead of inventing column names.** Every reality below is
sourced from this file with cell references.

### 11.2 Decisions locked from this review

| # | Decision | Status |
|---|----------|--------|
| L1 | **Demand period = annual only** for v1. Half-yearly (H1/H2) deferred — Balsane and most rural GPs run annual; revisit when an urban-ish GP onboards. | ✅ locked |
| L2 | **4 canonical tax heads**: `house \| lighting \| sanitation \| water` — mandatory, every register breaks them out. | ✅ locked |
| L3 | **Only house tax is derived** (capital_value × rate). The other 3 heads are stored flat per-property. | ✅ locked |
| L4 | **Head naming** is normalised to canonical English enum; Marathi label varies per register context (see 11.3.B). | ✅ locked |
| L5 | **Assessment validity = 4 years** (general revision cycle). N09 refreshes annually within an assessment block. | ✅ locked |

### 11.3 Gap log — what we got wrong / didn't model

#### A. N09 needs head-level breakdown — ✅ resolved in §3B.1

**Earlier assumption**: `gp_namuna9_demands.demand_amount bigint` (one lump per
property per year).

**Reality from `नमुना ९` sheet (19 cols, rows 4–6)**:

```
अ.क्र | घर नं | मालकाचे नाव | भोगवटदार |
करांच्या मागणीचा तपशील:
  घरपट्टी   { मागील | चालू | एकूण }
  सफाईपट्टी  { मागील | चालू | एकूण }
  दिवाबत्ती   { मागील | चालू | एकूण }
  पाणीपट्टी  { मागील | चालू | एकूण }
  एकुण       { मागील | चालू | एकूण }
```

Every head carries `मागील` (prior arrears) + `चालू` (current FY demand) +
`एकूण` (total). 4 heads × 3 sub-cols + 3 totals + 4 ID cols = exactly 19.

**Resolution**: implemented as `gp_namuna9_demands` (header) +
`gp_namuna9_demand_lines` (4-row child) — see §3B.1 for the canonical
schema, including the GENERATED `total_due_paise`, `status`, and the
`paid_paise <= previous + current` CHECK that prevents overpayment.

#### B. Head naming inconsistency — ✅ resolved (canonical enum + label map)

| Register | "Sanitation" head label |
|----------|------------------------|
| N08 (`नमुना ८` row 8 col 22) | **आरोग्य** |
| N09 (`नमुना ९` row 5 col 8) | **सफाईपट्टी** |
| बिल (`बिल` row 13) | **ज. सफाई कर** |
| वसुली रिपोर्ट (row 9) | **आरोग्य कर** |

Same head; different Marathi name per register. **Decision**: store the
canonical English enum (`sanitation`); render the Marathi label per register
context via a label map. Don't use Marathi as the primary key.

```ts
// apps/grampanchayat/lib/tax/labels.ts
export const TAX_HEAD_LABELS = {
  sanitation: {
    n08:   'आरोग्य',
    n09:   'सफाईपट्टी',
    bill:  'ज. सफाई कर',
    report:'आरोग्य कर',
  },
  // ... house, lighting, water
} as const;
```

#### C. Only house tax is derived — ✅ resolved in §4

**Earlier model**: all 4 heads driven by `tax-calc.ts` formulas.

**Reality from N08 cell formulas (row 10, cols 20–24)** — verified against
the actual workbook on 2026-04-25:

```
Col 20 (घरपट्टी)   = =IFERROR(R10*S10/1000,"")  ← capital_value × rate_paise / 1000
Col 21 (दिवाबत्ती) = 25                            ← flat literal
Col 22 (आरोग्य)    = 25                            ← flat literal
Col 23 (पाणीपट्टी) = 360                           ← flat literal
Col 24 (एकुण)     = =IFERROR(T10+U10+V10+W10,"") ← all 4 heads summed
```

> **Important corrections** (from a second pass): the divisor is `/1000`,
> not `/100`. The total spans 4 cells (T+U+V+W), not 3. These are propagated
> into §4 — that section is the source of truth for the formula.

Different rows have different flat values (row 11 has lighting=10,
sanitation=10, water=0 because that property has no water connection).

**Resolution**: implemented in §4 (formula) + Phase 2 of §12.1 (schema
migration). Only `houseTax` runs the formula; the 3 flat heads come from
per-property overrides on `gp_properties` falling back to GP defaults on
`gp_property_type_rates`.

#### D. Bill-time adjustments — ✅ resolved in §3C.1

**Reality from `बिल` sheet rows 17–20**:

```
५) ५% सूट        — 5% early-payment discount
६) ५% लेट फी     — 5% late fee
७) नोटीस फी      — notice service fee (when §129 notice was served)
८) इतर            — miscellaneous (free-form with reason)
```

These are computed **at receipt time**, not stored on the demand.

**Resolution**: 4 nullable adjustment columns on `gp_namuna10_receipts` —
see §3C.1. `total_paise` is computed by the `gp_namuna10_receipt_totals`
view (§3C.4) as `lines_total - discount + late_fee + notice_fee + other`.

#### E. §129 MVP Act 1958 is the legal hook on every demand notice

**Evidence**: `बिल` row 24 — *"कायदा कलम १२९ ..."* — literally printed on
the demand notice template Balsane uses.

**Implication**: when N09 row crosses a configurable due-date, system must
issue an N09-Ka demand notice citing §129. Track which properties received
notices (for `notice_fee_paise` to be valid on a subsequent receipt).

**Resolution**: deferred to **D2** in §12.2. Tracked as Open Question #6
in §10. v1 ships without automated notice issuance — `notice_fee_paise`
is enterable manually by the counter clerk if a paper notice was served.
Future schema sketch when D2 is pulled in:

```ts
gp_namuna9_notices {
  id, demand_id, served_at, served_by, citation, generated_pdf_path
}
```

#### F. N06 = monthly classified register — ✅ resolved in §0 + §3D

**Evidence**: each monthly tab (`April`, `May`, ... `March`) row 2 says
**"नमूना नं. ०६"**. Each row is a `लेखशीर्ष` (account head, e.g.
`0035-101` for residential property tax). 31 day-columns + monthly total +
running FY total.

So **N06 is monthly + classified**, **N05 is daily cashbook**. The §0
context block and §3D have been rewritten with the corrected identities
and table names: `gp_namuna05_cashbook_entries` (daily), `gp_namuna06_classified_receipts` (monthly).

#### G. N09 is per-property — multi-property owners get N rows

**Evidence**: Balsane's N09 has multiple consecutive rows under different
`घर नं.` (house numbers) for the same owner family. The unit of tracking
is **property**, not person.

**Implication for collection-desk UX**: search-by-owner returns N rows
(one per property); each row can be paid independently with its own N10
receipt. Don't aggregate at DB level — aggregate only at presentation.

#### H. उतारा = single-row print view of N08

**Evidence**: `उतारा` sheet (20 rows × 30 cols) row 13 contains
*तुकाराम महादू मासुळे* — same data as N08 row 12 — but laid out as a
A4-printable certificate (caption rows, single property, signature line).

**Implication**: don't model उतारा as a separate table. It's just an N08
detail page with a different print layout. Reuse `gp_namuna8_view` (or
its API equivalent) and add a `?layout=certificate` query.

#### I. Assessment validity is a 4-year block, not annual

**Evidence**: N08 sheet header row 3: *"सन २०२१/२२ ते २०२४"* — assessment
valid for 4 fiscal years. New assessment requires GP resolution.

**Implication for §3B.2 generate endpoint**: when generating N09 for a new
FY, the system reuses existing N08 capital values until a new assessment
block starts. Add `assessment_block_start_fy`, `assessment_block_end_fy`
on `gp_property_assessments` (a future table) — not blocking v1, but
flag for §10.

### 11.4 Cross-register invariants (for the test harness in §7)

These are the audit-grade reconciliation rules every implementation must
satisfy. Source: bottom of `वसुली रिपोर्ट` sheet — these formulas tie
N08 → N09 → N10 → N06 together.

```
INV-1   sum(N08.total_amount for property in FY)
        == sum(N09.demand_lines.current_paise for same property, FY)

INV-2   For any property × FY × tax_head:
        N09.previous_paise(this FY)
        == max(0, N09.demand+previous − paid)(prior FY)

INV-3   sum(gp_namuna10_receipt_totals.total_paise for month)
        == sum(N05 credits − N05 debits for month)
        == sum(gp_namuna06_view.month_total_paise for month)   ← 3-way tie
        (note: N06 is a view — equality is structural, not maintained)

INV-4   Every N10.line.demand_line_id resolves to a real
        N09.demand_lines row (no orphan receipts)

INV-5   Voided N10 → reversal entry in N05 + N06 on the void date
        (NOT back-dated to original receipt date)
```

### 11.5 Future references — when to consult what

| Question | Look at |
|----------|---------|
| What columns does N08 actually have? | `balsane-…ref.xlsx` → `नमुना ८` rows 6–8 |
| What does a real filled property row look like? | same → row 11 (शेख) or row 12 (तुकाराम) |
| How is capital value computed? | same → cell formulas in cols 11–18 |
| How does N09 layout look on paper? | same → `नमुना ९` rows 4–6 |
| What goes on a bill/demand notice? | same → `बिल` rows 1–28 |
| What does a monthly N06 look like? | same → `April` sheet |
| What's the per-head collection MIS? | same → `वसुली रिपोर्ट` |
| Property-type rate tables (master) | same → `न.८ साठीचे दर` |

---

## 12. Phased execution — status & gates

> One row = one PR-sized phase. Each phase ends with a **verify gate**
> before push. Update the **Status** column as we move.
> Status legend: ☐ todo · 🔄 in-progress · ✅ done (local) · 🟢 verified · 🚀 pushed

### 12.1 Phase plan

| # | Phase | Gap fixed | Files / scope | Verify gate | Status |
|---|-------|-----------|---------------|-------------|--------|
| **0** | Doc baseline — gap log + Balsane reference | — | `docs/specs/2026-04-24-…plan.md` §11, `docs/references/balsane-…xlsx` | Doc reviewed by domain owner | 🚀 |
| **1** | Foundation: `fiscal.ts` (incl. `fyMonthNo`), `money.ts` (`toPaise` HALF-UP), `tax-head.ts` TS enum + label map, `account-heads.ts` ledger-code constants | B | `apps/grampanchayat-api/src/lib/{fiscal,money,tax-head,account-heads}.ts`, `apps/grampanchayat/lib/tax/{labels,heads}.ts` | Unit tests for FY parse, `fyMonthNo` boundary cases (Mar/Apr), `toPaise` rounding (₹136.4063 → 13641), label lookup, account-head lookup | ☐ |
| **2** | Rate-master extension + per-property head overrides | C | Drizzle migration: extend `gp_property_type_rates` (default flat amounts), `gp_properties` (override columns) | Migration runs clean on dev; existing rows backfilled with NULLs (= use GP default) | ☐ |
| **3** | `tax-calc.ts` rewrite — house derived, others flat-with-fallback | C | `apps/grampanchayat-api/src/lib/tax-calc.ts` + golden-master tests | 20 seeded properties match Balsane row 10–12 exact paise values | ☐ |
| **4** | N08 read API + service | — | `namuna8.{service,controller}.ts`, route in `tenant.routes.ts` | `GET /:subdomain/namuna8` returns 4-head breakdown for seeded GP | ☐ |
| **5** | N08 admin list UI + filters | — | `app/[tenant]/(admin)/admin/namuna8/page.tsx`, sidebar nav | List renders, filters work, tier-gated | ☐ |
| **6** | N08 detail + उतारा print layout | H | `[id]/page.tsx`, `[id]/print/page.tsx` with `?layout=certificate` | A4 print preview matches Balsane `उतारा` sheet | ☐ |
| **7** | N09 schema — header + `demand_lines` child table | A | Drizzle schema `namuna9-demands.ts`, `namuna9-demand-lines.ts`, migration | Migration runs; INSERT 1 header + 4 lines works | ☐ |
| **8** | N09 generate API (current FY only, no arrears) | — | `namuna9.service.ts` `generate()`, controller, route | Generate twice → 0 duplicates; `INV-1` passes | ☐ |
| **9** | N09 list/detail UI + per-head columns | A | `app/[tenant]/(admin)/admin/namuna9/{page,[id]}.tsx` | Layout matches Balsane `नमुना ९` 4-heads × {मागील\|चालू\|एकूण} | ☐ |
| **10** | N09 print layout — physical register format | A | `namuna9/print/page.tsx` | Side-by-side print vs Balsane sheet — visual parity | ☐ |
| **11** | Opening balances XLSX template + import (writes `previous_paise` on current-FY lines — **no separate `'opening'` row**). Includes `gp_tenants` migration adding `opening_balance_imported_at` + `onboarding_complete` columns. | — | `namuna9.service.openingTemplate()`, `openingBalances()`, UI, `gp_tenants` migration | Happy path + bad-row rejection both proven on real Balsane sample; INV-2 holds; `opening_balance_imported_at` set after success | ☐ |
| **12** | Onboarding checklist UI — derives 6-step status, single button flips `onboarding_complete`. Generate endpoint enforces flag. | — | `admin/onboarding/page.tsx`, generate-endpoint 409 guard | Generate returns 409 while flag is false; flips to 200 after "Mark as ready" click | ☐ |
| **13** | N10 schema — receipts header + receipt-lines + `gp_receipt_sequences` + `gp_namuna10_receipt_totals` view + `gp_namuna9_demand_line_split` view | D | `namuna10-receipts.ts`, `namuna10-receipt-lines.ts`, `receipt-sequences.ts`, view migrations | Schema migration; row-lock concurrency test on `gp_receipt_sequences` (100 parallel inserts at same GP-FY → no dupes, no gaps); CHECK accepts walk-in payer (FK null + freetext set) | ☐ |
| **14** | N10 create endpoint + paid_paise propagation | A | `namuna10.service.create()` — single tx: insert receipt + lines, update demand_lines.paid_paise | `INV-4` passes; partial → full payment chain test | ☐ |
| **15** | N10 collection-desk UI — search → 4-head form → print | D | `admin/namuna10/page.tsx`, `receipt-form.tsx`, `[id]/print/page.tsx` | Counter UX matches Balsane `बिल` layout (4 heads + 4 adjustments) | ☐ |
| **16** | N10 void → reversal flow | F | `namuna10.service.void()` — same tx: mark void, reverse paid_paise, reverse N05/N06 entries | `INV-5` passes — reversal posts on void date, not back-dated | ☐ |
| **17** | N05 cashbook entries (table) + `gp_account_head` enum + `gp_namuna05_view` for running balance | F | `namuna05-cashbook-entries.ts`, enum migration, view migration, wired into N10 service | N10 insert → 1 N05 row appears in same tx; `gp_namuna05_view.running_balance_paise` correct under 100 parallel inserts | ☐ |
| **18** | N06 classified register **as a SQL view** (no table, no compile job) | F | `gp_namuna06_view` migration only | `INV-3` 3-way tie passes for a seeded month — by structure, not by maintenance | ☐ |
| **19** | N05/N06 read UIs (read-only) | — | `admin/namuna5/page.tsx`, `admin/namuna6/page.tsx` | Lists render with running balance + per-head monthly classification matching Balsane `April` sheet layout | ☐ |
| **20** | Invariant test harness — INV-1..INV-5 | — | `tests/integration/tax-chain-invariants.test.ts` | All 5 invariants run green on seeded 500-property GP | ☐ |
| **21** | End-to-end demo seed + smoke test | — | `scripts/seed-demo-gp.ts` — Balsane-shaped data | One-command spin-up: gen N09 → collect → void → reconcile | ☐ |

### 12.2 Deferred (post-launch backlog)

| # | Item | Gap | Trigger to pull in |
|---|------|-----|-------------------|
| D1 | Half-yearly demand period (H1/H2) | — | First urban-ish GP onboards that needs it |
| D2 | §129 demand-notice issuance + tracking | E | Any GP requests automated arrears recovery |
| D3 | 4-year assessment blocks (`gp_property_assessments`) | I | Second assessment cycle hits in 2030 |
| D4 | Per-GP overrides for depreciation / usage weightage | — | First GP files a complaint about state default |
| D5 | Bank reconciliation flow | — | Cheque/NEFT volume becomes painful |
| D6 | SMS reminders on pending demands | — | After collection-desk volume stable |

### 12.3 Push cadence

- **Phases 1–6** ship as one logical bundle (N08 read flow). Push after Phase 6 is 🟢.
- **Phases 7–12** ship as the second bundle (N09 + onboarding). Push after Phase 12 is 🟢.
- **Phases 13–16** = the collection-desk bundle. Push after Phase 16 is 🟢.
- **Phases 17–21** = automation + reconciliation bundle. Push after Phase 21 is 🟢.

Reasoning: each bundle is independently demoable. A bundle never pushes
half-finished — invariants must hold at every push checkpoint, otherwise
the next phase inherits a broken base.

### 12.4 Per-phase verify checklist (apply to every row above)

Before flipping a phase to 🟢:

- [ ] Drizzle migration runs clean on a fresh dev DB
- [ ] `pnpm --filter @gp/grampanchayat-api typecheck` green
- [ ] `pnpm --filter grampanchayat typecheck` green
- [ ] Lint clean (`pnpm lint`)
- [ ] Unit / integration tests for this phase pass
- [ ] Relevant invariant (INV-x) — if applicable — proven
- [ ] Manual smoke: counter user can complete the action this phase enables
- [ ] No leakage: anon Supabase key cannot read tax tables (RLS audit)
- [ ] **§2.7 simplicity rules respected**: no triggers, no background
      jobs, no unenforced denormalised caches introduced. If any of these
      were added, the PR description explains the case.

