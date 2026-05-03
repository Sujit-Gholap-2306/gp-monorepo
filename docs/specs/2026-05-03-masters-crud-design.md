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
4. **DB-level auto-increment** — `citizen_no` and `property_no` assigned via atomic DB counter table (same pattern as `gp_receipt_sequences`). No `MAX() + 1` at app level.
5. **Standardised dropdowns** — `pipe_size_inch` stored as `numeric(3,1)`, displayed as "1 इंच", "1.5 इंच" etc. `property_type`, `connection_type` always dropdowns, never free text.

---

## DB Changes

### 1. `gp_master_sequences` — new table

Atomic per-GP counters for citizen_no and property_no.

```sql
CREATE TABLE gp_master_sequences (
  gp_id       uuid NOT NULL REFERENCES gp_tenants(id) ON DELETE CASCADE,
  entity      text NOT NULL,   -- 'citizen' | 'property'
  next_no     bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (gp_id, entity),
  CONSTRAINT entity_check CHECK (entity IN ('citizen', 'property'))
);
```

**Allocation (same pattern as N10 receipt sequences):**
```sql
INSERT INTO gp_master_sequences (gp_id, entity, next_no)
VALUES ($gpId, 'citizen', 2)
ON CONFLICT (gp_id, entity)
DO UPDATE SET next_no = gp_master_sequences.next_no + 1
RETURNING next_no - 1 AS allocated;
```
Returns the allocated number atomically. If two concurrent inserts race, each gets a unique number.

**Seeding:** On first `POST /masters/citizens`, if no sequence row exists, initialize from `MAX(citizen_no)` for that GP (handles existing data).

### 2. `gp_water_connections.pipe_size_mm` → `pipe_size_inch`

**Column rename + type change:**

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

**New response shape:**
```ts
{
  inserted: number
  skipped: number
  errors: Array<{ row: number; field?: string; message: string }>
}
```

**FE behaviour:**
- `inserted > 0 && errors.length === 0` → success toast "N records imported"
- `inserted > 0 && errors.length > 0` → warning toast "N imported, M failed" + expandable error panel listing each failed row
- `inserted === 0 && errors.length > 0` → error toast "Import failed" + error panel

**Implementation pattern:**
```ts
const errors: ImportError[] = []
const toInsert: NewGpCitizen[] = []

for (const [i, row] of parsed.data.entries()) {
  // validate uniqueness against existing DB records (pre-fetch all citizen_nos)
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
PATCH  /:subdomain/masters/citizens/:id          update (citizen_no locked) — NEW
```

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
Backend auto-assigns `citizen_no` from `gp_master_sequences`. Returns full row including assigned `citizen_no`.

**PATCH body (all optional):** same fields minus `citizen_no` (locked, never in body).

**List search:** Add `?q=` (name search), `?ward=` filter to existing endpoint.

### Properties

```
GET    /:subdomain/masters/properties            list (existing — add search)
GET    /:subdomain/masters/properties/:id        get single — NEW
POST   /:subdomain/masters/properties            create single (auto property_no) — NEW
PATCH  /:subdomain/masters/properties/:id        update (property_no locked) — NEW
```

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
Backend auto-assigns `property_no` from `gp_master_sequences` (e.g., "1", "2", "3").

**PATCH:** All editable fields. `property_no`, `owner_citizen_id` are locked (not accepted in body).

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
│   └── [id]/
│       └── page.tsx                  ← view + edit (client)
├── citizens/
│   └── new/
│       └── page.tsx                  ← add form (client)
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
- Table: citizen_no | नाव (Marathi) | वार्ड | मोबाईल | पत्ता | Action
- Search bar (q), ward filter dropdown
- "नवीन नागरिक" button → `/masters/citizens/new`
- Row click → `/masters/citizens/[id]`

### Citizens Add/Edit Form

**Locked (display-only in edit, hidden in add):**
- `citizen_no` — assigned by system, shown in edit as badge

**Editable fields:**
| Field | Input | Validation |
|-------|-------|------------|
| नाव (मराठी) `name_mr` | text | required, min 2 |
| नाव (इंग्रजी) `name_en` | text | optional |
| मोबाईल `mobile` | tel | 10 digits |
| वार्ड `ward_number` | text/select | required |
| पत्ता `address_mr` | textarea | required |
| आधार शेवटचे ४ `aadhaar_last4` | text | 4 digits, optional |
| कुटुंब ID `household_id` | text | optional |

### Properties List Page

- Server component — `?q=`, `?ward=`, `?property_type=`
- Table: property_no | मालक | मालमत्ता प्रकार | क्षेत्रफळ | वार्ड | Action
- "नवीन मालमत्ता" button

### Properties Add/Edit Form

**Locked:**
- `property_no` — shown in edit as badge
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
| बांधकाम वर्ष `age_bracket` | dropdown | after_2000 / after_2010 etc. |
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
- `consumer_no` → auto-generated by system (shown after save)
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

| Field | Locked after create? | Reason |
|-------|---------------------|--------|
| `citizen_no` | ✅ Yes | Printed on documents, FK in property/demand |
| `citizen_id` on property | ✅ Yes | Owner transfer requires separate process |
| `property_no` | ✅ Yes | Printed on N08/N09 registers |
| `property_type` on rates | ✅ Yes | Exactly 5 types, no add/delete |
| `connection_type` on water | ✅ Yes | Rate-key field |
| `pipe_size_inch` on water | ✅ Yes | Rate-key field |
| `consumer_no` | ✅ Yes (auto) | Printed on water demand |
| `citizen_id` on water | ✅ Yes | Consumer identity |

---

## Auto-Increment Design (DB-level)

### `gp_master_sequences` allocation flow

```
POST /masters/citizens (single add)
  ↓
BEGIN TRANSACTION
  ↓
INSERT INTO gp_master_sequences (gp_id, entity, next_no)
  -- initialize from existing data if first time
  SELECT $gpId, 'citizen', COALESCE(MAX(citizen_no), 0) + 2
  FROM gp_citizens WHERE gp_id = $gpId
ON CONFLICT (gp_id, entity)
DO UPDATE SET next_no = gp_master_sequences.next_no + 1
RETURNING next_no - 1 AS allocated_no
  ↓
INSERT INTO gp_citizens (..., citizen_no = allocated_no)
  ↓
COMMIT
```

Race condition: two concurrent inserts → unique ON CONFLICT guarantees each gets a different number. The unique constraint on `(gp_id, citizen_no)` is the final guard.

Same pattern for `property_no` with entity = `'property'`.

**Bulk import** does NOT use `gp_master_sequences` — bulk assigns the `citizen_no`/`property_no` from the Excel file. Sequence is updated only on single-add. If bulk is used after single-add, user must ensure no overlap (validated at import, per-row error if conflict).

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

1. **Phase 1 — DB**: `gp_master_sequences` table + `pipe_size_mm → pipe_size_inch` migration. Update BE constants + DTO validation.
2. **Phase 2 — Bulk import fix**: Per-row error collection for citizens + properties. Update FE import page error UI.
3. **Phase 3 — Citizens CRUD**: BE `GET /:id`, `POST /`, `PATCH /:id` + FE list, add, edit pages.
4. **Phase 4 — Properties CRUD**: Same pattern as citizens.
5. **Phase 5 — Property type rates UI**: FE grid edit page (API already exists).
6. **Phase 6 — Water connections FE**: List, add, edit pages (all API exists, Phase B).
7. **Phase 7 — Water connection rates FE**: Rate grid page per FY (API exists, Phase C).
8. **Phase 8 — Sidebar + navigation**: Wire all pages into sidebar nav.

---

## Out of Scope

- Delete/archive for citizens or properties (linked to N09 demands — safe delete requires cascade check)
- Citizen merge (duplicate detection)
- Property transfer (owner change workflow)
- Bulk update/overwrite — never silently, always insert-only for bulk
- Water connection consumer_no custom format (always system-assigned sequential)
