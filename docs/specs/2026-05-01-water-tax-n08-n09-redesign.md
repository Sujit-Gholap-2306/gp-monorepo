# Water Tax Redesign — N08 Removal + Water Connections Master (N09/N10)

**Date:** 2026-05-01  
**Status:** Draft  
**Scope:** Namuna 8, Namuna 9, Namuna 10 (partial)

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

**`src/lib/tax-head.ts`**: Remove `'water'` from `TAX_HEADS`.

```ts
export const TAX_HEADS = ['house', 'lighting', 'sanitation'] as const
```

**`src/lib/tax-calc.ts`**: Remove `waterTaxPaise` from `TaxCalcPropertyInput`, `defaultWaterPaise` from `TaxCalcRateInput`, `waterPaise` from `PropertyTaxBreakdown` and total calculation.

**`src/services/namuna8.service.ts`**: Remove all water paise fields from select, rate mapping, and `mapNamuna8Row`.

**`src/services/namuna9.service.ts`**: Remove water demand line from generation. DB check constraint changes from 4 heads to 3.

**`src/db/schema/namuna9-demand-lines.ts`**: Update CHECK:
```sql
tax_head IN ('house', 'lighting', 'sanitation')
```

### Migration

```sql
ALTER TABLE gp_properties DROP COLUMN water_tax_paise;
ALTER TABLE gp_property_type_rates DROP COLUMN default_water_paise;
-- Drop + re-add namuna9 demand lines tax_head CHECK (3 heads)
```

---

## Change 2 — Water Connections Master

Water consumers are maintained as a separate master per GP. A citizen may have a water connection; not all citizens do. One citizen can have at most one connection per GP.

### New table: `gp_water_connections`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `gp_id` | uuid FK → `gp_tenants` CASCADE | |
| `citizen_id` | uuid FK → `gp_citizens` RESTRICT | Payer is always a citizen |
| `consumer_no` | text NOT NULL | Unique reference per GP (e.g. W-001) |
| `connection_type` | text NOT NULL | CHECK IN ('regular', 'specialized') |
| `pipe_size_mm` | integer | Nominal bore in mm; nullable |
| `status` | text NOT NULL DEFAULT 'active' | CHECK IN ('active', 'disconnected') |
| `connected_at` | date | When connection was established |
| `notes` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Constraints:**
- UIDX: `(gp_id, consumer_no)`
- IDX: `(gp_id, citizen_id)`

### New table: `gp_water_connection_rates`

Rate master per GP, per fiscal year, per connection type. GP must configure rates before generating water demand.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `gp_id` | uuid FK → `gp_tenants` CASCADE | |
| `fiscal_year` | text NOT NULL | Format `YYYY-YY` e.g. `2026-27` |
| `connection_type` | text NOT NULL | CHECK IN ('regular', 'specialized') |
| `annual_paise` | bigint NOT NULL | Annual water tax in paise |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Constraints:**
- UIDX: `(gp_id, fiscal_year, connection_type)`
- CHECK: `annual_paise > 0`

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
- UIDX: `(demand_id)` — one line per demand [VERIFY: split by half-year like N09 or annual?]
- CHECK: `previous_paise >= 0 AND current_paise >= 0 AND paid_paise >= 0`
- CHECK: `paid_paise <= previous_paise + current_paise`

### Generation logic

1. Check rate master exists for `(gp_id, fiscal_year, connection_type)` — error if missing.
2. For each active `gp_water_connection` in GP:
   - Skip if demand already exists for this FY (idempotent).
   - `previous_paise` = sum of unpaid `total_due_paise` from prior FY demand line (if any).
   - `current_paise` = `annual_paise` from rate master for connection's `connection_type`.
   - Insert demand header + one demand line.
3. Return count of generated demands.

### N09 register view

The N09 register must display both property demands and water connection demands. The service layer returns both sets, sorted by citizen/consumer reference.

```
N09 Report = property demands (house/lighting/sanitation) + water connection demands
```

Each row in the report identifies:
- For property demand: property_no, owner citizen, ward
- For water demand: consumer_no, citizen name, connection_type

---

## Change 4 — N10 Water Receipt Book (future phase)

> **Scope:** High-level design only. Implementation is a separate phase after N09 water is stable.

Two N10 receipt books:
- **Book 1 (Property):** Collects house/lighting/sanitation. Links to `gp_namuna9_demand_lines`.
- **Book 2 (Water):** Collects water tax. Links to `gp_water_connection_demand_lines`.

Each book has its own receipt number sequence (separate `gp_receipt_sequences` rows keyed by `book_type`).

**Schema additions needed (future):**
- `gp_namuna10_receipts`: Add `book_type` ('property' | 'water'), make `property_id` nullable, add `water_connection_id` nullable FK. CHECK: exactly one set.
- `gp_namuna10_receipt_lines`: Add `water_demand_line_id` nullable FK, make `demand_line_id` nullable. CHECK: exactly one set.
- Or: separate `gp_namuna10_water_receipts` + `gp_namuna10_water_receipt_lines` tables (cleaner, avoids nullable FKs).

Decision deferred to N10 water phase.

---

## Open Questions [VERIFY]

| # | Question | Impact |
|---|----------|--------|
| V1 | Is water demand split by half-year (H1 Apr–Sep / H2 Oct–Mar) like property demand, or annual only? | `gp_water_connection_demand_lines` structure — one row vs two rows per demand |
| V2 | Can one citizen have multiple water connections (e.g., house + shop)? | UIDX on `(gp_id, citizen_id)` — unique or index only |
| V3 | Are pipe sizes standardised (15mm, 20mm, 25mm, etc.) or free text? | `pipe_size_mm` as integer enum vs text |
| V4 | Is arrear for water tax carried from prior FY like property tax (previous_paise)? | Generation logic |
| V5 | What receipt number format for water book? Same `YYYY-YY/NNNNNN` or different prefix? | Receipt sequence config |

---

## Out of Scope

- Lighting/sanitation area-based slabs — not implemented (flat rates retained).
- Frontend pages for water connections master CRUD.
- Frontend page for water demand generation.
- Water receipt (N10 Book 2) — separate phase.
- Namuna 20 — not applicable to this GP product.

---

## Implementation Order

1. **Phase A — N08 cleanup**: Remove water from properties, rates, tax-calc, TAX_HEADS, N09 demand lines constraint. Migrations + tests.
2. **Phase B — Water connections master**: Schema + CRUD API (create, list, update, status toggle).
3. **Phase C — Water rate master**: Schema + CRUD API (configure annual rates per FY per connection type).
4. **Phase D — N09 water demand generation**: Generate demand from master, carry arrears, N09 view update.
5. **Phase E — N10 water receipt book**: Separate N10 collection for water (design finalized in [Change 4]).
