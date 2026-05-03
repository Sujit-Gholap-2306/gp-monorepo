# Masters CRUD — Full Design Spec

**Date:** 2026-05-03  
**Status:** Approved  
**Scope:** Citizens, Properties, Property Type Rates, Water Connections, Water Connection Rates

---

## Background

Current state — all masters are bulk-import only (Excel upload). Issues:

| Problem | Impact |
|---------|--------|
| Bulk import fails entire batch on first conflict | One bad row blocks 200 good rows |
| No individual add/edit | Gram Sevak cannot correct a typo or add a late registration |
| No search/view pages | No way to verify imported data |
| `citizen_no`/`property_no` assigned manually in Excel | Inconsistency, gaps, duplicates |
| `pipe_size_mm` (integer mm) — GPs use inches | Confusing; 1", 1.5", 2", 2.5" are the real units |
| Water connections/rates CRUD API exists (Phase B/C) | No FE pages built yet |

---

## Design Principles

1. **Insert-only bulk** — bulk upload never overwrites existing rows. Conflicts are reported per row, valid rows continue.
2. **Explicit individual CRUD** — add/edit one record at a time via form. No batch side-effects.
3. **No silent overrides** — every destructive or mutating action returns explicit feedback (toast + error list).
4. **DB-level auto-increment (single-add only)** — `citizen_no` and `property_no` auto-assigned via atomic DB counter on single-add. Bulk import lets user provide their own numbers (needed for cross-sheet FK linking). Neither is ever used as an API update key — UUID `id` is always the record identifier.
5. **Standardised dropdowns** — `pipe_size_inch` stored as `numeric(3,1)`, displayed as "1 इंच", "1.5 इंच" etc. `property_type`, `connection_type` always dropdowns, never free text.

---

## DB Changes

### 1. `gp_master_sequences` — new table

Atomic per-GP counters for `citizen_no`, `property_no`, and `consumer_no` (single-add only — bulk uses user-provided values).

```sql
CREATE TABLE gp_master_sequences (
  gp_id       uuid NOT NULL REFERENCES gp_tenants(id) ON DELETE CASCADE,
  entity      text NOT NULL,   -- 'citizen' | 'property'
  next_no     bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (gp_id, entity),
  CONSTRAINT entity_check CHECK (entity IN ('citizen', 'property', 'water_connection'))
);
```

**Allocation — always re-anchors from MAX:**
```sql
INSERT INTO gp_master_sequences (gp_id, entity, next_no)
  SELECT $gpId, 'citizen', COALESCE(MAX(citizen_no), 0) + 2
  FROM gp_citizens WHERE gp_id = $gpId
ON CONFLICT (gp_id, entity)
DO UPDATE SET next_no = GREATEST(
  gp_master_sequences.next_no + 1,
  excluded.next_no
)
RETURNING next_no - 1 AS allocated;
```

- **First use (empty table):** inserts `0 + 2 = 2`, `RETURNING 2 - 1 = 1`. ✓  
- **Normal increment:** `excluded.next_no = MAX+2 ≤ next_no+1` → `GREATEST` picks `next_no+1`, returns next sequential. ✓  
- **After bulk import (sequence stale):** `excluded.next_no = new_MAX+2 > next_no+1` → `GREATEST` resets to `new_MAX+2`, returns `new_MAX+1`. No collision. ✓  
- **Concurrent inserts:** `ON CONFLICT DO UPDATE` serializes; second thread sees updated `next_no`, gets a distinct number. `(gp_id, citizen_no)` UNIQUE is the final guard.

Bulk import does NOT touch `gp_master_sequences`. The `GREATEST` pattern self-corrects on the next single-add.

### 2. `gp_water_connections.pipe_size_mm` → `pipe_size_inch`

**Column rename + type change:**

> Note: These tables were created in Phase B/C migrations with `pipe_size_mm` as integer. GP data was cleared before this spec (demo reset). Migration assumes no data — if rows exist, add a `UPDATE` step to convert integer mm values to inch before the CHECK constraint is added (e.g., `UPDATE gp_water_connections SET pipe_size_mm = CASE WHEN pipe_size_mm = 25 THEN 1 ...`).

```sql
ALTER TABLE gp_water_connections
  RENAME COLUMN pipe_size_mm TO pipe_size_inch;

ALTER TABLE gp_water_connections
  ALTER COLUMN pipe_size_inch TYPE numeric(3,1);

ALTER TABLE gp_water_connection_rates
  RENAME COLUMN pipe_size_mm TO pipe_size_inch;

ALTER TABLE gp_water_connection_rates
  ALTER COLUMN pipe_size_inch TYPE numeric(3,1);
```

**Allowed values (CHECK constraint — replace existing `pipe_size_check`):**
```sql
ALTER TABLE gp_water_connections DROP CONSTRAINT gp_water_connections_pipe_size_check;
ALTER TABLE gp_water_connections ADD CONSTRAINT gp_water_connections_pipe_size_check
  CHECK (pipe_size_inch IN (1.0, 1.5, 2.0, 2.5));

ALTER TABLE gp_water_connection_rates DROP CONSTRAINT gp_water_connection_rates_pipe_size_check;
ALTER TABLE gp_water_connection_rates ADD CONSTRAINT gp_water_connection_rates_pipe_size_check
  CHECK (pipe_size_inch IN (1.0, 1.5, 2.0, 2.5));
```

**Schema constants (BE):**
```ts
// water-connections.ts
export const PIPE_SIZES_INCH = [1.0, 1.5, 2.0, 2.5] as const
export type PipeSizeInch = (typeof PIPE_SIZES_INCH)[number]
```

**Marathi labels (FE `lib/tax/labels.ts`):**
```ts
export const PIPE_SIZE_LABELS: Record<number, string> = {
  1.0: '१ इंच',
  1.5: '१.५ इंच',
  2.0: '२ इंच',
  2.5: '२.५ इंच',
}
```

---

## Bulk Import Changes (Citizens + Properties)

**Current:** Fail entire batch on first unique constraint violation.  
**New:** Per-row error collection. Valid rows inserted. Conflicts reported individually.

### Why user provides citizen_no / property_no in bulk

GPs prepare all 3 master sheets in one Excel file. Properties and water connections reference citizens via `citizen_no` (not UUID). Import service resolves these cross-references to UUIDs during the import transaction:

```
Citizens sheet:    citizen_no | name | ward | ...
Properties sheet:  property_no | owner_citizen_no | property_type | ...
Water sheet:       citizen_no (FK) | connection_type | pipe_size_inch | ...
```

Import order: **citizens → properties → water connections** (FK dependency).  
Property import fetches `citizen_no → UUID` map after inserting citizens, then resolves `owner_citizen_no` → `owner_citizen_id` UUID.

If a property row references a `citizen_no` that doesn't exist (neither in current import nor in existing DB), it's a per-row error: `owner_citizen_no X not found`.

### New response shape
```ts
{
  inserted: number
  skipped: number
  errors: Array<{ row: number; field?: string; message: string }>
}
```

**FE behaviour:**
- `inserted > 0 && errors.length === 0` → success toast "N records imported"
- `inserted > 0 && errors.length > 0` → warning toast "N imported, M failed" + expandable error panel
- `inserted === 0 && errors.length > 0` → error toast "Import failed" + error panel

### Implementation pattern (citizens)
```ts
const errors: ImportError[] = []
const toInsert: NewGpCitizen[] = []

// pre-fetch existing citizen_nos to avoid N+1 uniqueness checks
const existingNos = new Set(await fetchExistingCitizenNos(gpId))

for (const [i, row] of parsed.data.entries()) {
  if (existingNos.has(row.citizen_no)) {
    errors.push({ row: i + 2, field: 'citizen_no', message: `citizen_no ${row.citizen_no} already exists` })
    continue
  }
  toInsert.push(mapRow(row))
}

if (toInsert.length > 0) {
  await db.insert(gpCitizens).values(toInsert)
}
return { inserted: toInsert.length, skipped: errors.length, errors }
```

Pre-fetch approach (not try/catch per row) avoids partial transaction failures.

---

## Backend API — New Endpoints

### Citizens

```
GET    /:subdomain/masters/citizens              list (existing — add search param)
GET    /:subdomain/masters/citizens/:id          get single — NEW
POST   /:subdomain/masters/citizens              create single (auto citizen_no) — NEW
PATCH  /:subdomain/masters/citizens/:id          update — NEW
```

Route param `/:id` is always the UUID. `citizen_no` is never a route param or PATCH body field.

**POST body:**
```json
{
  "name_mr": "सोपान पाटील",
  "name_en": "Sopan Patil",
  "mobile": "9000000001",
  "ward_number": "1",
  "address_mr": "वार्ड 1, घर 5",
  "aadhaar_last4": "1234",
  "household_id": "H-005"
}
```
Backend auto-assigns `citizen_no` from `gp_master_sequences`. Returns full row including `citizen_no` (display only).

**PATCH body (all optional):** same fields. `citizen_no` is never accepted — ignored if sent.

**List search:** Add `?q=` (name search), `?ward=` filter to existing endpoint.

### Properties

```
GET    /:subdomain/masters/properties            list (existing — add search)
GET    /:subdomain/masters/properties/:id        get single — NEW
POST   /:subdomain/masters/properties            create single (auto property_no) — NEW
PATCH  /:subdomain/masters/properties/:id        update — NEW
```

Route param `/:id` is always the UUID. `property_no` is never a route param or PATCH body field.

**POST body:**
```json
{
  "owner_citizen_id": "uuid",
  "property_type": "dagad_vit_pucca",
  "length_ft": 30,
  "width_ft": 20,
  "occupant_name": "सोपान पाटील",
  "survey_number": "S-12",
  "plot_or_gat": "GAT-5",
  "age_bracket": "after_2010",
  "resolution_ref": "RES-2025/01",
  "assessment_date": "2026-04-01",
  "lighting_tax_paise": null,
  "sanitation_tax_paise": null
}
```
Backend auto-assigns `property_no` from `gp_master_sequences`. Returns full row including `property_no` (display only).

**PATCH:** All editable fields. `property_no` and `owner_citizen_id` are never accepted in body.

**List search:** Add `?q=` (property_no / owner name), `?ward=`, `?property_type=` to existing endpoint.

### Property Type Rates

```
GET    /:subdomain/masters/property-type-rates              list (existing)
GET    /:subdomain/masters/property-type-rates/:propertyType  get single — NEW
PUT    /:subdomain/masters/property-type-rates              upsert array (existing)
```

No add/delete — exactly 5 rows per GP (one per property type). Edit via `PUT` with single-row array. `property_type` is locked in UI (dropdown, not editable after selection).

### Water Connections

All CRUD API exists (Phase B). No new endpoints.

```
GET    /:subdomain/masters/water-connections               list
GET    /:subdomain/masters/water-connections/:id           get single
POST   /:subdomain/masters/water-connections               create
PATCH  /:subdomain/masters/water-connections/:id           update
PATCH  /:subdomain/masters/water-connections/:id/status    toggle active/disconnected
```

Schema change: `pipe_size_mm` → `pipe_size_inch` (migration required, see DB Changes).

### Water Connection Rates

All API exists (Phase C). No new endpoints.

```
GET    /:subdomain/masters/water-connection-rates          list
PUT    /:subdomain/masters/water-connection-rates          upsert array
```

Schema change: `pipe_size_mm` → `pipe_size_inch` (migration required).

---

## Frontend Pages

### Route Structure

```
app/[tenant]/(admin)/admin/masters/
├── page.tsx                          ← redirect → /masters/citizens
├── citizens/
│   ├── page.tsx                      ← list + search (server component)
│   ├── new/
│   │   └── page.tsx                  ← add form (client)
│   └── [id]/
│       └── page.tsx                  ← view + edit (client)
├── properties/
│   ├── page.tsx                      ← list + search (server component)
│   ├── new/
│   │   └── page.tsx                  ← add form (client)
│   └── [id]/
│       └── page.tsx                  ← view + edit (client)
├── property-type-rates/
│   └── page.tsx                      ← grid edit (all 5 rows, client)
├── water-connections/
│   ├── page.tsx                      ← list + search (server component)
│   ├── new/
│   │   └── page.tsx                  ← add form (client)
│   └── [id]/
│       └── page.tsx                  ← view + edit (client)
├── water-connection-rates/
│   └── page.tsx                      ← rate grid per FY (client)
└── import/
    └── page.tsx                      ← bulk import (existing, update error UI)
```

### Citizens List Page

- Server component — fetches with `?q=` and `?ward=` from URL search params
- Table: क्र.नं (citizen_no) | नाव (Marathi) | वार्ड | मोबाईल | पत्ता | Action
- Search bar (q), ward filter dropdown
- "नवीन नागरिक" button → `/masters/citizens/new`
- Row click → `/masters/citizens/[id]`

### Citizens Add/Edit Form

**Locked (display-only in edit, hidden in add):**
- `citizen_no` — auto-assigned on single-add, user-provided on bulk. Shown in edit as badge. Never sent in PATCH body.

**Editable fields:**
| Field | Input | Validation |
|-------|-------|------------|
| नाव (मराठी) `name_mr` | text | required, min 2 |
| नाव (इंग्रजी) `name_en` | text | optional |
| मोबाईल `mobile` | tel | 10 digits |
| वार्ड `ward_number` | text | required, free text (GPs vary 5-17 wards; no central wards master) |
| पत्ता `address_mr` | textarea | required |
| आधार शेवटचे ४ `aadhaar_last4` | text | 4 digits, optional |
| कुटुंब ID `household_id` | text | optional |

### Properties List Page

- Server component — `?q=`, `?ward=`, `?property_type=`
- Table: क्र.नं (property_no) | मालक | मालमत्ता प्रकार | क्षेत्रफळ | वार्ड | Action
- "नवीन मालमत्ता" button

### Properties Add/Edit Form

**Locked:**
- `property_no` — auto-assigned on single-add, user-provided on bulk. Shown in edit as badge. Never sent in PATCH body.
- `owner_citizen_id` — locked after creation (citizen cannot be reassigned)

**Editable fields:**
| Field | Input | Notes |
|-------|-------|-------|
| मालक (add only) `owner_citizen_id` | searchable select → citizen | locked after save |
| मालमत्ता प्रकार `property_type` | dropdown (5 types) | labels in Marathi |
| रहिवासी `occupant_name` | text | required |
| लांबी (फूट) `length_ft` | number | positive |
| रुंदी (फूट) `width_ft` | number | positive |
| सर्व्हे नं `survey_number` | text | optional |
| गट/प्लॉट `plot_or_gat` | text | optional |
| बांधकाम वर्ष `age_bracket` | dropdown | `before_2000` / `2000_to_2010` / `after_2010` |
| ठराव संदर्भ `resolution_ref` | text | optional |
| मूल्यांकन दिनांक `assessment_date` | date | optional |
| दिवाबत्ती (override) `lighting_tax_paise` | rupee input | optional, overrides GP default |
| स्वच्छता (override) `sanitation_tax_paise` | rupee input | optional, overrides GP default |

### Property Type Rates Page

- Grid: 5 rows (one per property type), all editable inline
- Columns: मालमत्ता प्रकार (locked) | जमीन दर/sqft | बांधकाम दर/sqft | नवीन बांधकाम दर | दिवाबत्ती (₹) | स्वच्छता (₹)
- Single "जतन करा" button — saves all 5 rows via `PUT /masters/property-type-rates`
- Show existing vs unsaved changes indicator

### Water Connections List + Add/Edit

**List:** consumer_no | नागरिक | जोडणी प्रकार | आकार (इंच) | स्थिती | Action

**Add form — locked after save:**
- `citizen_id` → searchable citizen select
- `connection_type` → dropdown: सामान्य / विशेष
- `pipe_size_inch` → dropdown: 1" / 1.5" / 2" / 2.5"
- `consumer_no` → auto-generated by system via `gp_master_sequences` (entity = `'water_connection'`), shown after save
- `connected_at` → date picker
- `notes` → textarea

**Edit form — locked:**
- `citizen_id`, `connection_type`, `pipe_size_inch`, `consumer_no` all display-only
- Editable: `connected_at`, `notes`
- Separate "स्थिती बदला" toggle button (active ↔ disconnected)

### Water Connection Rates Page

- Filter: fiscal year selector (current FY default)
- Grid: rows = pipe sizes (1", 1.5", 2", 2.5") × columns = connection types (सामान्य, विशेष)
- Each cell: editable rupee amount
- "जतन करा" button → `PUT /masters/water-connection-rates` (upserts all)
- Rate completeness indicator (matches demand generation check)

---

## Locked vs Editable Summary

| Field | Locked after create? | Update key? | Reason |
|-------|---------------------|-------------|--------|
| `citizen_no` | ✅ Display only | ❌ Use UUID `id` | Printed on documents; bulk cross-link key; never used to identify record in API calls |
| `property_no` | ✅ Display only | ❌ Use UUID `id` | Printed on N08/N09; bulk cross-link key; never used to identify record in API calls |
| `owner_citizen_id` on property | ✅ Yes | — | Owner transfer requires separate process |
| `property_type` on rates | ✅ Yes | — | Exactly 5 types, no add/delete |
| `connection_type` on water | ✅ Yes | — | Rate-key field |
| `pipe_size_inch` on water | ✅ Yes | — | Rate-key field |
| `consumer_no` on water | ✅ Display only | ❌ Use UUID `id` | Printed on water demand; system-assigned via sequence |
| `citizen_id` on water | ✅ Yes | — | Consumer identity |

---

## Auto-Increment Design (DB-level)

### `gp_master_sequences` allocation flow

```
POST /masters/citizens (single add)
  ↓
BEGIN TRANSACTION
  ↓
INSERT INTO gp_master_sequences (gp_id, entity, next_no)
  SELECT $gpId, 'citizen', COALESCE(MAX(citizen_no), 0) + 2
  FROM gp_citizens WHERE gp_id = $gpId
ON CONFLICT (gp_id, entity)
DO UPDATE SET next_no = GREATEST(
  gp_master_sequences.next_no + 1,
  excluded.next_no
)
RETURNING next_no - 1 AS allocated_no
  ↓
INSERT INTO gp_citizens (..., citizen_no = allocated_no)
  ↓
COMMIT
```

`citizen_no` is for display/printing and Excel cross-linking only. Updates always use UUID `id` route param — `citizen_no` never accepted in PATCH body. Same pattern for properties (entity = `'property'`) and water connections (entity = `'water_connection'`).

**Bulk import** does NOT touch `gp_master_sequences`. User provides `citizen_no`/`property_no` in Excel. Per-row conflict check against existing DB. The next single-add self-corrects sequence via `GREATEST`.

---

## Navigation (Sidebar)

Add Masters section to admin sidebar with sub-links:

```
Masters
  ├── नागरिक (Citizens)
  ├── मालमत्ता (Properties)
  ├── मालमत्ता प्रकार दर (Property Type Rates)
  ├── पाणी जोडण्या (Water Connections)
  ├── पाणी दर (Water Connection Rates)
  └── Excel आयात (Bulk Import)
```

---

## Implementation Order

1. **Phase 1 — DB**: Create `gp_master_sequences` table. Rename `pipe_size_mm → pipe_size_inch`. Update BE schema constants + DTO validation.
2. **Phase 2 — Bulk import fix**: Per-row error collection for citizens + properties. Update FE import page error UI.
3. **Phase 3 — Citizens CRUD**: BE `GET /:id`, `POST /`, `PATCH /:id` + FE list, add, edit pages.
4. **Phase 4 — Properties CRUD**: Same pattern as citizens.
5. **Phase 5 — Property type rates UI**: FE grid edit page (API already exists).
6. **Phase 6 — Water connections FE**: List, add, edit pages (all API exists, Phase B).
7. **Phase 7 — Water connection rates FE**: Rate grid page per FY (API exists, Phase C).
8. **Phase 8 — Sidebar + navigation**: Wire all pages into sidebar nav.

---

## Known Issues / Deferred

Issues found in PR review — deferred for later:

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | P3 | `water-demands.service.ts:329` | JS arithmetic on paise for totals accumulation. Values are `bigint` columns returned as JS `number` via Drizzle `mode: 'number'`. No overflow risk at GP scale (max ~10,000 ₹ = 1,000,000 paise, well within 2^53) but inconsistent with paise-as-integer contract elsewhere. Should switch to `BigInt` accumulation when refactoring this service. |
| 2 | P3 | `masters-bulk-api.ts` / FE list pages | `MASTERS_LIST_MAX = 2000` cap on citizen/property list with no indicator when truncated. GPs with >2000 citizens/properties will see incomplete dropdowns in property form silently. Add a count check + warning UI before GP reaches scale. |

---

## Out of Scope

- Delete/archive for citizens or properties (linked to N09 demands — safe delete requires cascade check)
- Citizen merge (duplicate detection)
- Property transfer (owner change workflow)
- Bulk update/overwrite — never silently, always insert-only for bulk
- Water connection consumer_no custom format (always system-assigned sequential)
