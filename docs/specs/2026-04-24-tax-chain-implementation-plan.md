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
N08 (Assessment)  →  N09 (Demand)  →  N10 (Collection)  →  N05 / N06 (Income / Cashbook)
```

- **N08** — मालमत्ता कर आकारणी नोंदवही (Property Tax Assessment Register).
  Static register of every property and its computed annual tax.
- **N09** — मागणी नोंदवही (Demand Register). Yearly roll-up: "property X owes ₹Y
  this fiscal year, plus ₹Z arrears." Generated once per fiscal year from N08
  × rate master.
- **N10** — वसुली नोंदवही (Collection Register). Receipts issued when citizens
  pay. Every receipt decrements the matching N09 row.
- **N05** — उत्पन्न दैनिक नोंदवही (Daily Income Register). Auto-linked from N10
  receipts.
- **N06** — रोख पुस्तक (Cashbook). Auto-linked from N10 receipts.

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
| Masters — property-type-rates | ✅ API |
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

### 2.5 All money in integer **paise**, not rupees-with-decimals
- Store `demand_amount`, `paid_amount`, `arrears` as `bigint` (paise).
- Convert to ₹ only at the presentation layer.
- Eliminates float rounding bugs across the chain.

### 2.6 Idempotent "generate" operations
- `POST /namuna9/generate?year=2026-27` must be safely re-runnable.
- Enforced via `UNIQUE(gp_id, property_id, fiscal_year)` constraint + `ON
  CONFLICT DO NOTHING` (or `DO UPDATE` where explicitly re-pricing).

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

#### 3B.1 Schema

File: `apps/grampanchayat-api/src/db/schema/namuna9-demands.ts`

```ts
gp_namuna9_demands {
  id                uuid PK
  gp_id             uuid FK gp_tenants(id) ON DELETE CASCADE
  property_id       uuid FK gp_properties(id) ON DELETE RESTRICT
  fiscal_year       text        -- 'YYYY-YY' or 'opening' for carry-forward
  is_opening_balance boolean default false

  demand_amount     bigint      -- paise, current-year tax for this year
  arrears           bigint      -- paise, unpaid from prior years (snapshot
                                --         at generate time)
  paid_amount       bigint      -- paise, sum of matched N10 receipts
  total_due         bigint GENERATED ALWAYS AS
                      (demand_amount + arrears - paid_amount) STORED
  status            text CHECK IN ('pending','partial','paid','waived')

  generated_at      timestamptz default now()
  generated_by      uuid        -- user id of Gram Sevak who ran generate
  notes             text
  created_at, updated_at timestamptz
}

UNIQUE INDEX (gp_id, property_id, fiscal_year, is_opening_balance)
INDEX (gp_id, fiscal_year, status)
INDEX (gp_id, property_id)
```

**Why `is_opening_balance` in the unique key**: one property can have:
- `(…, 'opening', true)` — migrated historic arrears row
- `(…, '2026-27', false)` — normal current-year demand

Both co-exist; neither is duplicated.

**Why `total_due` is GENERATED STORED**: single source of truth, no drift,
indexable.

#### 3B.2 API

Routes:
- `POST /:subdomain/namuna9/generate` — body: `{ fiscalYear: '2026-27' }`
  - For each property in tenant:
    - Compute `demand_amount` = `calcPropertyTax(...).totalTax` × 100 (paise)
    - Compute `arrears` = sum of `total_due` from prior-year rows where
      `status != 'paid'` (includes `is_opening_balance` rows)
    - Insert with `ON CONFLICT (gp_id, property_id, fiscal_year,
      is_opening_balance) DO UPDATE SET demand_amount = EXCLUDED.demand_amount,
      arrears = EXCLUDED.arrears, updated_at = now()`
      *(only if re-pricing is explicitly requested via `?force=true`;
      default is `DO NOTHING`)*
  - Return: `{ year, generated, skipped, totalDemand }`
- `GET  /:subdomain/namuna9?year=2026-27&ward=&status=` — list
- `GET  /:subdomain/namuna9/:id` — detail
- `PATCH /:subdomain/namuna9/:id` — Gram Sevak can add `notes`, `waive`, but
  NOT edit `demand_amount` directly (must be regenerated from rates)

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
- [ ] Clicking Generate for 2026-27 creates one row per property.
- [ ] Clicking Generate again → no duplicates, count = 0 new rows.
- [ ] Arrears column correctly sums prior unpaid rows.
- [ ] Filter by status works.
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
2. Fills per property:
   - `property_no` (must match properties master)
   - `arrears_prior_years` (₹, total unpaid from all years before current FY)
   - `current_year_demand` (₹, already calculated by GP — their number wins,
     not ours, for the first year)
   - `current_year_paid` (₹, any collection already done this FY)
3. Uploads via admin UI.
4. Backend creates:
   - One row `is_opening_balance = true, fiscal_year = 'opening'`,
     `demand_amount = arrears_prior_years * 100`, `status = 'pending'`
   - One row `is_opening_balance = false, fiscal_year = '<current-FY>'`,
     `demand_amount = current_year_demand * 100`,
     `paid_amount = current_year_paid * 100`, status computed.
5. Flags the GP as `onboarding_complete = true` so generate can run normally
   next year.

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
- `POST /:subdomain/namuna9/opening-balances` — multipart upload
  - Validates: every `property_no` exists, all amounts non-negative
  - Runs in single transaction; returns row-level errors on failure
- After successful run, sets `gp_tenants.onboarding_complete = true`

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
- [ ] Template download works.
- [ ] Invalid rows rejected with clear per-row errors.
- [ ] Successful import populates 2 rows per property (opening + current).
- [ ] N09 list after import shows correct arrears + current demand.
- [ ] Onboarding flag blocks generate-demand if not complete.

---

### Phase C — N10 (Collection Register)

**Goal**: record tax receipts; every receipt decrements the corresponding N09
row. This is where Gram Sevaks spend most of their day.

#### 3C.1 Schema

File: `namuna10-receipts.ts`

```ts
gp_namuna10_receipts {
  id                uuid PK
  gp_id             uuid FK gp_tenants(id) ON DELETE CASCADE
  demand_id         uuid FK gp_namuna9_demands(id) ON DELETE RESTRICT
  property_id       uuid FK gp_properties(id) ON DELETE RESTRICT
  payer_citizen_id  uuid FK gp_citizens(id) ON DELETE RESTRICT
  receipt_no        text        -- GP-controlled series, e.g. '2026-27/0001'
  amount_paise      bigint       -- paise
  paid_at           timestamptz
  payment_mode      text CHECK IN ('cash','upi','cheque','neft','other')
  reference         text         -- cheque no, UPI txn id, etc.
  is_void           boolean default false
  void_reason       text
  created_by        uuid
  created_at, updated_at timestamptz
}

UNIQUE INDEX (gp_id, receipt_no)  -- receipt numbers unique per GP
INDEX (gp_id, paid_at)
INDEX (demand_id)
```

#### 3C.2 Business rules

- Receipt amount ≤ demand's `total_due` at time of creation.
- On insert: recompute and update parent `gp_namuna9_demands.paid_amount`
  (sum of non-void receipts for that demand). Status transitions:
  - `paid_amount >= demand_amount + arrears` → `status = 'paid'`
  - `paid_amount > 0 && < full` → `status = 'partial'`
  - else `pending`
- Void: never hard-delete. `is_void = true` + `void_reason`; recompute parent.
- **Single DB transaction** for receipt insert + demand update.
- Receipt number: auto-generated `YYYY-YY/NNNN` (GP-scoped sequence).

#### 3C.3 API

- `POST   /:subdomain/namuna10` — body: `{ demand_id, amount_paise, paid_at,
  payment_mode, reference?, payer_citizen_id }`
- `GET    /:subdomain/namuna10?from=&to=&property_id=&mode=` — list
- `GET    /:subdomain/namuna10/:id` — detail (for receipt print)
- `POST   /:subdomain/namuna10/:id/void` — body: `{ reason }`

#### 3C.4 Frontend

- `lib/api/namuna10.ts`
- `app/[tenant]/(admin)/admin/namuna10/page.tsx` — collection desk:
  - Search by property / owner / receipt no
  - On click → receipt form (pre-filled with demand total-due)
  - On submit → inline receipt print
- `app/[tenant]/(admin)/admin/namuna10/[id]/print/page.tsx` — receipt print
  format (thermal 80 mm + A5 options)
- `components/admin/receipt-form.tsx`
- Quick-entry keyboard flow (Enter = save & print, Tab flow optimised)

**Acceptance**:
- [ ] Receipt against pending demand → demand becomes partial/paid.
- [ ] Cannot create receipt for amount > total_due.
- [ ] Void → demand's paid_amount decreases; status recomputes.
- [ ] Receipt print renders cleanly.
- [ ] Concurrent receipts on same demand don't double-count (tx isolation).

---

### Phase D — N05 / N06 Auto-link

**Goal**: show automation. Every N10 receipt auto-creates rows in N05
(daily income) and N06 (cashbook). Read-only in demo.

#### 3D.1 Schemas

```ts
gp_namuna05_income_log {
  id, gp_id,
  date, head text,        -- 'property_tax' for tax chain
  description text,
  amount_paise bigint,
  source_type text,       -- 'namuna10'
  source_id uuid,         -- → gp_namuna10_receipts.id
  created_at
}

gp_namuna06_cashbook {
  id, gp_id,
  date, entry_type text CHECK IN ('credit','debit'),
  head text,
  description text,
  amount_paise bigint,
  running_balance_paise bigint,   -- snapshot, recomputed on insert
  source_type text,
  source_id uuid,
  created_at
}
```

#### 3D.2 Wiring

- In `namuna10.service.ts create()` — inside the same transaction that
  inserts the receipt:
  1. Insert `gp_namuna05_income_log` row
  2. Compute new running balance → insert `gp_namuna06_cashbook` row
- Void path mirrors with reversing entries (never delete rows).

#### 3D.3 API + UI

- `GET /:subdomain/namuna5?from=&to=`
- `GET /:subdomain/namuna6?from=&to=`
- `app/[tenant]/(admin)/admin/namuna5/page.tsx` — daily income list
- `app/[tenant]/(admin)/admin/namuna6/page.tsx` — cashbook with running
  balance column + date filter

**Acceptance**:
- [ ] Issuing an N10 receipt auto-creates N05 + N06 rows.
- [ ] Voiding an N10 receipt creates reversing entries in N05 + N06.
- [ ] Cashbook running balance is correct across any date filter.

---

## 4. Tax calculation reference

Formula used today in `lib/namuna8.ts` — to be moved to
`grampanchayat-api/src/lib/tax-calc.ts`:

```
areaSqFt         = length_ft * width_ft
areaSqM          = areaSqFt / 10.7639

landValue        = areaSqM * landRatePerSqM         -- per-sqm
                 = areaSqFt * landRatePerSqFt       -- OR per-sqft
buildingValue    = areaSqM * constructionRatePerSqM
                   * depreciationFactor(ageBracket)
                   * usageWeightage(propertyUsage)

capitalValue     = landValue + buildingValue

houseTax         = capitalValue * taxRatePaise / 1000
diwabatti        = fixed per property (from master or property)
arogya           = fixed
panipatti        = fixed

totalTax         = houseTax + diwabatti + arogya + panipatti
```

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

1. ⬜ Set GP profile (name, logo, contact) — in Settings
2. ⬜ Rate master — all property types have land/construction/new rates
3. ⬜ Citizens master imported (XLSX)
4. ⬜ Properties master imported (XLSX)
5. ⬜ **Opening balances imported** (XLSX — prior arrears + current FY state)
6. ⬜ Admin users added (at least Gram Sevak)
7. ✅ Ready to generate N09 for current fiscal year

Until step 6 is green, hide N09 generate button. Once green, mark
`gp_tenants.onboarding_complete = true`.

---

## 6. Execution order

Recommended (smallest → biggest, each shippable):

1. **A** — N08 on tenant admin (no new tables; validates API chain for tax
   data end-to-end).
2. **B.1** — N09 schema + generate endpoint + list UI (current FY only, no
   arrears yet).
3. **B2** — Opening balances import + `is_opening_balance` field + retroactive
   arrears computation in generate.
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

## 10. Open questions (resolve before Phase C)

1. Receipt number format — GP-wide sequence or per-FY sequence? Suggest
   per-FY: `2026-27/0001`.
2. Who can void a receipt? Any admin, or only senior Gram Sevak role?
   (Affects role-check in controller.)
3. What about partial payments straddling FY — does paying a 2025-26 arrear
   receipt attribute income to FY 2025-26 or 2026-27 in N05? Standard practice:
   attribute to **payment date's FY**, not demand's FY. Confirm with domain.
4. Who owns depreciation / usage weightage values — state default (hard-coded)
   or per-GP override? Phase-1 = hard-coded; phase-2 = per-GP if needed.
5. When the legacy `(dashboard)` demo routes get removed — before launch or
   kept for sales demos?
