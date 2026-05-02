# Water Tax Redesign — N08 Removal + Water Connections Master (N09/N10)

**Date:** 2026-05-01  
**Status:** Draft - key decisions locked on 2026-05-01  
**Scope:** Namuna 8, Namuna 9, Namuna 10 (partial)

---

## Locked Decisions

Resolved on 2026-05-01:

| Topic | Decision |
|-------|----------|
| Water demand period | Annual only. No half-year or monthly split for now. |
| Connections per citizen | One water connection per citizen per GP for now. Enforce with UIDX `(gp_id, citizen_id)`. |
| Rate dimensions | Pipe size affects rate. Water rates are keyed by fiscal year, connection type, and pipe size. |
| Arrears | Water demand carries `previous_paise` like property demand, and needs opening arrear import during onboarding. |
| Marathi labels | `regular` = `सामान्य`, `specialized` = `विशेष`. |
| Account head | Remove `property_tax_water` from `GP_ACCOUNT_HEADS` and `TAX_HEAD_TO_ACCOUNT_HEAD` (both API + FE). Add new `water_tax` text constant. Ledger code: `0035-105` (continuing series: house=0035-101, lighting=0035-102, sanitation=0035-103, water=0035-104 retired). Update in both `apps/grampanchayat-api/src/lib/account-heads.ts` and `apps/grampanchayat/lib/tax/heads.ts`. |
| N10 water structure | Approach locked: existing N10 receipt tables extended with `book_type` ('property'\|'water'), nullable target FKs, and strict CHECKs. Implementation is Phase F (deferred until N09 water is stable). |

---

## Background

Current implementation incorrectly treats water tax as a property-based flat amount in N08 and N09. Maharashtra GP practice separates water tax:

- **Namuna 8 (N08):** Property assessment. Water tax does NOT appear here.
- **Namuna 9 (N09):** Demand register. Property demand (house/lighting/sanitation) and water connection demand coexist in the same register but are generated from different sources.
- **Namuna 10 (N10):** Two receipt books — one for property taxes, one for water tax. Both use N10 format.

---

## Change 1 — Remove Water from N08

### What changes

Water tax is **not assessed per property** in Namuna 8. It has no entry in the assessment register.

### Schema changes

**`gp_properties`**: Drop column `water_tax_paise`.

**`gp_property_type_rates`**: Drop column `default_water_paise`.

### Code changes

**`src/lib/tax-head.ts`** (API): Remove `'water'` from property-tax `TAX_HEADS`.

```ts
export const TAX_HEADS = ['house', 'lighting', 'sanitation'] as const
```

**`apps/grampanchayat/lib/tax/heads.ts`** (FE): Same — remove `'water'` from `TAX_HEADS`, remove `'property_tax_water'` from `GP_ACCOUNT_HEADS`, add `'water_tax'` to `GP_ACCOUNT_HEADS`.

**`src/lib/account-heads.ts`** (API):
- Remove `'property_tax_water'` from `GP_ACCOUNT_HEADS`.
- Remove `water` entry from `TAX_HEAD_TO_ACCOUNT_HEAD` (type becomes `Record<'house'|'lighting'|'sanitation', GpAccountHead>`).
- Remove `property_tax_water: '0035-104'` from `ACCOUNT_HEAD_LEDGER_CODE`.
- Add `water_tax: '0035-105'` to `GP_ACCOUNT_HEADS` and `ACCOUNT_HEAD_LEDGER_CODE`.

**`src/lib/tax-calc.ts`**: Remove `waterTaxPaise` from `TaxCalcPropertyInput`, `defaultWaterPaise` from `TaxCalcRateInput`, `waterPaise` from `PropertyTaxBreakdown` and total calculation.

**`src/services/namuna8.service.ts`**: Remove all water paise fields from select, rate mapping, and `mapNamuna8Row`.

**`src/services/namuna9.service.ts`**: Remove water demand line from generation. DB check constraint changes from 4 heads to 3.

**`src/db/schema/namuna9-demand-lines.ts`**: Update CHECK:
```sql
tax_head IN ('house', 'lighting', 'sanitation')
```

### Migration

```sql
-- Prototype: wipe water rows before tightening constraint (no prod data)
DELETE FROM gp_namuna9_demand_lines WHERE tax_head = 'water';
-- Also delete orphaned N05 rows posted under property_tax_water account head
DELETE FROM gp_namuna05_cashbook_entries WHERE account_head = 'property_tax_water';
ALTER TABLE gp_properties DROP COLUMN water_tax_paise;
ALTER TABLE gp_property_type_rates DROP COLUMN default_water_paise;
-- Drop + re-add namuna9 demand lines tax_head CHECK (3 heads)
```

> **Prototype note:** DELETE is safe — no production data exists. When approaching
> production onboarding, revisit if any GP has real water demand rows that need
> converting to water-connection demands instead.

---

## Change 2 — Water Connections Master

Water consumers are maintained as a separate master per GP. A citizen may have
a water connection; not all citizens do. One citizen can have at most one
connection per GP for now.

### New table: `gp_water_connections`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `gp_id` | uuid FK → `gp_tenants` CASCADE | |
| `citizen_id` | uuid FK → `gp_citizens` RESTRICT | Payer is always a citizen |
| `consumer_no` | text NOT NULL | Unique reference per GP (e.g. W-001) |
| `connection_type` | text NOT NULL | CHECK IN ('regular', 'specialized'); labels: `सामान्य`, `विशेष` |
| `pipe_size_mm` | integer NOT NULL | Nominal bore in mm; used for rate lookup |
| `status` | text NOT NULL DEFAULT 'active' | CHECK IN ('active', 'disconnected') |
| `connected_at` | date | When connection was established |
| `notes` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Constraints:**
- UIDX: `(gp_id, consumer_no)`
- UIDX: `(gp_id, citizen_id)` — one connection per citizen per GP for now
- CHECK: `pipe_size_mm > 0`

### Phase B implementation plan (locked)

1. Add schema module `gp_water_connections` with strict constraints.
2. Add tenant-admin CRUD APIs under `/:subdomain/masters/water-connections`.
3. Keep migration generation/execution in normal Drizzle flow (no manual SQL apply in this phase).

### Phase B implementation delivered (2026-05-02)

- Backend schema file added:
  - `apps/grampanchayat-api/src/db/schema/water-connections.ts`
- Schema export wired:
  - `apps/grampanchayat-api/src/db/schema/index.ts`
- DTOs added:
  - `apps/grampanchayat-api/src/types/water-connections.dto.ts`
- Service added:
  - `apps/grampanchayat-api/src/services/water-connections.service.ts`
- Controller added:
  - `apps/grampanchayat-api/src/controllers/water-connections.controller.ts`
- Routes mounted (tenant admin):
  - `GET /:subdomain/masters/water-connections`
  - `GET /:subdomain/masters/water-connections/:id`
  - `POST /:subdomain/masters/water-connections`
  - `PATCH /:subdomain/masters/water-connections/:id`
  - `PATCH /:subdomain/masters/water-connections/:id/status`

### New table: `gp_water_connection_rates`

Rate master per GP, per fiscal year, per connection type, per pipe size. GP
must configure rates before generating water demand.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `gp_id` | uuid FK → `gp_tenants` CASCADE | |
| `fiscal_year` | text NOT NULL | Format `YYYY-YY` e.g. `2026-27` |
| `connection_type` | text NOT NULL | CHECK IN ('regular', 'specialized'); labels: `सामान्य`, `विशेष` |
| `pipe_size_mm` | integer NOT NULL | Must match connection pipe size |
| `annual_paise` | bigint NOT NULL | Annual water tax in paise |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Constraints:**
- UIDX: `(gp_id, fiscal_year, connection_type, pipe_size_mm)`
- CHECK: `pipe_size_mm > 0`
- CHECK: `annual_paise > 0`
- CHECK: `fiscal_year ~ '^\d{4}-\d{2}$'`

---

## Change 3 — N09 Water Demand

Water demand is generated separately from property demand. It is displayed in the same N09 register view but stored in separate tables.

### New table: `gp_water_connection_demands`

One row per water connection per fiscal year.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `gp_id` | uuid FK → `gp_tenants` CASCADE | |
| `water_connection_id` | uuid FK → `gp_water_connections` RESTRICT | |
| `fiscal_year` | text NOT NULL | |
| `generated_at` | timestamptz NOT NULL DEFAULT now() | |
| `generated_by` | uuid | GP admin who generated |
| `notes` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Constraints:**
- UIDX: `(gp_id, water_connection_id, fiscal_year)`
- IDX: `(gp_id, fiscal_year)`
- CHECK: `fiscal_year ~ '^\d{4}-\d{2}$'`

### New table: `gp_water_connection_demand_lines`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `demand_id` | uuid FK → `gp_water_connection_demands` CASCADE | |
| `previous_paise` | bigint NOT NULL DEFAULT 0 | Arrear from prior FY |
| `current_paise` | bigint NOT NULL DEFAULT 0 | Current FY demand from rate master |
| `paid_paise` | bigint NOT NULL DEFAULT 0 | Updated on N10 receipt |
| `total_due_paise` | bigint GENERATED | `previous + current - paid` |
| `status` | text GENERATED | `'paid'` / `'partial'` / `'pending'` — same logic as N09 |
| `notes` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Constraints:**
- UIDX: `(demand_id)` — one annual line per demand
- CHECK: `previous_paise >= 0 AND current_paise >= 0 AND paid_paise >= 0`
- CHECK: `paid_paise <= previous_paise + current_paise`

### Rate master completeness check

Before generation, expose a status API (analogous to N08 `getRateMasterStatus`):
- Query all distinct `(connection_type, pipe_size_mm)` combinations from active connections.
- For each, check if a rate row exists in `gp_water_connection_rates` for the target `fiscal_year`.
- Return `{ isComplete: boolean, missingCombinations: Array<{ connection_type, pipe_size_mm }> }`.
- UI must show this status and block generation if incomplete.

### Generation logic

1. Run completeness check — fail entire generation if any active connection has no rate configured.
2. For each active `gp_water_connection` in GP:
   - Skip if demand already exists for this FY (idempotent).
   - `previous_paise` = value of unpaid `total_due_paise` from prior FY demand line (if any, else 0).
   - `current_paise` = `annual_paise` from rate master matching connection's `connection_type` + `pipe_size_mm`.
   - Insert demand header + one demand line.
3. Return count of generated demands.

### Opening arrear import

Water demands need the same onboarding support as property N09 opening balances.
Add an import/template flow that updates `previous_paise` on the current-FY
water demand line after demand generation.

Template columns:
- `consumer_no`
- `citizen_no`
- `citizen_name`
- `connection_type`
- `pipe_size_mm`
- `current_paise` (reference only; not imported)
- `previous_paise` (editable/imported)
- `total_paise` (reference only)

Rules:
- Import only updates existing current-FY water demand lines.
- Unknown `consumer_no` or mismatched citizen/connection data is a row error.
- `previous_paise` must be `>= 0`.
- `paid_paise` is never imported here; collection must happen via N10 water receipts.

### N09 register view

The N09 register must display both property demands and water connection demands. The service layer returns both sets, sorted by citizen/consumer reference.

```
N09 Report = property demands (house/lighting/sanitation) + water connection demands
```

Each row in the report identifies:
- For property demand: property_no, owner citizen, ward
- For water demand: consumer_no, citizen name, connection_type

API rows must be discriminated so UI and receipt prefill never infer the target
from nullable fields:

```ts
type Namuna9ReportRow =
  | { demandKind: 'property'; propertyId: string; propertyNo: string; lines: PropertyDemandLine[] }
  | { demandKind: 'water'; waterConnectionId: string; consumerNo: string; line: WaterDemandLine }
```

---

## Change 4 — N10 Water Receipt Book (future phase)

> **Scope:** High-level design only. Implementation is a separate phase after N09 water is stable.

Two N10 receipt books:
- **Book 1 (Property):** Collects house/lighting/sanitation. Links to `gp_namuna9_demand_lines`.
- **Book 2 (Water):** Collects water tax. Links to `gp_water_connection_demand_lines`.

Each book has its own receipt number sequence (separate `gp_receipt_sequences` rows keyed by `book_type`).

**Chosen schema additions (future, Phase F):**
- `gp_namuna10_receipts`: Add `book_type` text NOT NULL DEFAULT 'property' CHECK IN ('property', 'water'). Make `property_id` nullable. Add `water_connection_id` nullable FK → `gp_water_connections`. CHECK: exactly one of `property_id`/`water_connection_id` is NOT NULL.
- `gp_namuna10_receipt_lines`: Add `water_demand_line_id` nullable FK → `gp_water_connection_demand_lines`. Make existing `demand_line_id` nullable. CHECK: exactly one FK is set per line.
- `gp_receipt_sequences`: Add `book_type` text NOT NULL DEFAULT 'property'. Backfill existing rows to `'property'`. Unique key becomes `(gp_id, fiscal_year, book_type)`.
- Receipt uniqueness UIDX changes to `(gp_id, book_type, receipt_no)`.
- Water receipt N05 rows post under account head `water_tax` (ledger code `0035-105`).
- N05 source-line CHECK must allow `water_tax` account head rows from water N10 receipts.

> **Prototype note:** `gp_receipt_sequences` backfill is a single `UPDATE … SET book_type = 'property'` — trivial on prototype data.

Receipt format remains `YYYY-YY/NNNNNN` per book; the book type disambiguates
property vs water receipt sequences.

Accounting impact:
- `water_tax` text constant (ledger code `0035-105`) added to `GP_ACCOUNT_HEADS` and `ACCOUNT_HEAD_LEDGER_CODE` in both API and FE (as per Locked Decisions).
- `property_tax_house`, `property_tax_lighting`, `property_tax_sanitation` remain for property receipts (`0035-101` through `0035-103`).
- `property_tax_water` (`0035-104`) is retired — removed from constants, existing rows deleted in prototype migration.
- N05 source-line CHECK must allow `water_tax` account head from water N10 receipt lines.

---

## Resolved Questions

| # | Question | Impact |
|---|----------|--------|
| V1 | Is water demand split by half-year (H1 Apr-Sep / H2 Oct-Mar) like property demand, or annual only? | Annual only; one demand line per water connection per FY. |
| V2 | Can one citizen have multiple water connections (e.g., house + shop)? | No for now; enforce UIDX `(gp_id, citizen_id)`. |
| V3 | Are pipe sizes standardised (15mm, 20mm, 25mm, etc.) or free text? | Store as integer `pipe_size_mm`; rates are keyed by pipe size. |
| V4 | Is arrear for water tax carried from prior FY like property tax (previous_paise)? | Yes; add water opening arrear import. |
| V5 | What receipt number format for water book? Same `YYYY-YY/NNNNNN` or different prefix? | Same format per book; sequence and uniqueness include `book_type`. |

---

## Remaining Questions [VERIFY]

| # | Question | Impact |
|---|----------|--------|
| R1 | If a connection starts or disconnects mid-FY, do we still charge the full annual amount or pro-rate? | Generation logic and rate calculation. Default implementation should charge full annual amount unless this is confirmed otherwise. |
| R2 | For existing dev/demo data with property-based water rows, should migration delete/regenerate or convert to water-connection demands? | Migration safety and test data continuity. |

---

## Out of Scope

- Lighting/sanitation area-based slabs — not implemented (flat rates retained).
- Frontend pages for water connections master CRUD.
- Frontend page for water demand generation.
- Water receipt (N10 Book 2) — separate phase.
- Namuna 20 — not applicable to this GP product.

---

## Implementation Order

1. **Phase A — N08 cleanup** ✅ DONE (2026-05-02): Water removed from properties, rates, tax-calc, TAX_HEADS, N09 demand lines, account-heads. Migration `0017_remove_water_from_n08_n09.sql` applied.
2. **Phase B — Water connections master**: Schema + CRUD API (create, list, update, status toggle).
3. **Phase C — Water rate master**: Schema + CRUD API (configure annual rates per FY, connection type, and pipe size).
4. **Phase D — N09 water demand generation**: Generate annual demand from master, carry arrears, N09 view update.
5. **Phase E — Water opening arrear import**: Template + import flow that updates `previous_paise` on generated current-FY water demand lines.
6. **Phase F — N10 water receipt book**: Separate N10 collection for water using shared N10 tables with `book_type`.

---

## API Endpoint Specifications (Phases B–E)

### Phase B — Water Connections

```
GET    /:subdomain/water/connections               list all connections for GP
POST   /:subdomain/water/connections               create single connection
PATCH  /:subdomain/water/connections/:id           update connection (name/notes/pipe_size)
PATCH  /:subdomain/water/connections/:id/status    toggle active ↔ disconnected
```

**POST body:**
```json
{
  "citizen_id": "uuid",
  "consumer_no": "W-001",
  "connection_type": "regular",
  "pipe_size_mm": 15,
  "connected_at": "2024-04-01",
  "notes": ""
}
```

**List response item:**
```json
{
  "id": "uuid",
  "consumer_no": "W-001",
  "connection_type": "regular",
  "pipe_size_mm": 15,
  "status": "active",
  "connected_at": "2024-04-01",
  "citizen": { "citizen_id": "uuid", "citizen_no": 42, "name_mr": "...", "name_en": null },
  "created_at": "..."
}
```

### Phase C — Water Connection Rates

```
GET    /:subdomain/water/rates?fiscal_year=2026-27   list rates for FY
PUT    /:subdomain/water/rates                        upsert rate rows (array)
GET    /:subdomain/water/rates/status?fiscal_year=2026-27   completeness check
```

**PUT body:**
```json
[
  { "fiscal_year": "2026-27", "connection_type": "regular", "pipe_size_mm": 15, "annual_paise": 36000 },
  { "fiscal_year": "2026-27", "connection_type": "specialized", "pipe_size_mm": 25, "annual_paise": 72000 }
]
```

**Rate status response:**
```json
{
  "is_complete": false,
  "missing_combinations": [
    { "connection_type": "regular", "pipe_size_mm": 20 }
  ]
}
```

### Phase D — Water Demand Generation

```
POST   /:subdomain/water/demands/generate           generate for fiscal_year
GET    /:subdomain/water/demands?fiscal_year=2026-27  list demands with lines
```

**Generate body:**
```json
{ "fiscal_year": "2026-27" }
```

**Generate response:**
```json
{ "generated": 45, "skipped": 3 }
```

### Phase E — Water Opening Arrear Import

```
GET    /:subdomain/water/demands/arrears/template?fiscal_year=2026-27   download XLSX
POST   /:subdomain/water/demands/arrears/import                          import XLSX
```

---

## Existing Patterns to Follow

| What | Reference file |
|------|---------------|
| Controller class pattern | `src/controllers/namuna8.controller.ts` |
| Service pattern (list + create) | `src/services/namuna8.service.ts` |
| Demand generation service | `src/services/namuna9.service.ts` `generate()` |
| Rate master upsert | `src/services/property-type-rates.service.ts` |
| Opening template + import | `src/services/namuna9-opening-template.service.ts`, `src/services/namuna9-opening-balances.service.ts` |
| Route registration | `src/routes/tenant.routes.ts` |
| DTO schemas (zod) | `src/types/namuna8.dto.ts`, `src/types/namuna9.dto.ts` |
| Drizzle schema file | `src/db/schema/namuna9-demands.ts` |
| Schema export barrel | `src/db/schema/index.ts` — add new tables here |
| Migration file format | `drizzle/migrations/0017_remove_water_from_n08_n09.sql` |
| Migration journal | `drizzle/migrations/meta/_journal.json` — add entry with next idx + when |

**Auth pattern:** All tenant routes use `requireAuth` + `requireFeature('tax')` guards from `src/common/guards/`.

**Money:** All amounts in paise (`bigint`). Use `toPaise()` / `fromPaise()` from `src/lib/money.ts`.

**Fiscal year format:** `YYYY-YY` text (e.g. `2026-27`). Validated with `~ '^\d{4}-\d{2}$'`.

**Error handling:** Throw `new ApiError(statusCode, message)` from `src/common/exceptions/http.exception.ts`.

**No shared code** between `grampanchayat-api` and `grampanchayat` apps.
