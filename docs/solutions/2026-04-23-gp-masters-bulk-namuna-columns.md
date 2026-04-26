# GP masters bulk import — column ↔ namuna mapping

**Scope:** `gp_citizens` and `gp_properties` filled via `POST .../masters/citizens/bulk` and `.../properties/bulk` in `grampanchayat-api`.

**Templates (API is source of truth):** Excel files and the column/limits list are generated on the server so they stay aligned when Zod or DB fields change. Admin clients call (with tenant admin auth):

- `GET /api/v1/tenants/:subdomain/masters/template-meta` — JSON: limits, column keys/required/hints, allowed enums
- `GET /api/v1/tenants/:subdomain/masters/citizens/template` — `gp-masters-citizens-template.xlsx`
- `GET /api/v1/tenants/:subdomain/masters/properties/template` — `gp-masters-properties-template.xlsx`

**Single source of truth:** `apps/grampanchayat-api/src/types/masters-bulk.dto.ts` defines `CITIZEN_IMPORT_FIELDS` and `PROPERTY_IMPORT_FIELDS` (each field: `key`, `required`, `hint`, and Zod). From those we derive `citizenRowSchema` / `propertyRowSchema` (used by bulk POST), `CITIZENS_TEMPLATE_COLUMNS` / `PROPERTIES_TEMPLATE_COLUMNS` (used by `GET /masters/template-meta` and `masters-bulk-template.service.ts` for .xlsx). `MASTERS_BULK_MAX_FILE_MB` in `masters-bulk-template.meta.ts` is shared with the multer upload limit in `bulk-upload.guard.ts`.

## `gp_citizens` (citizen master)

| DB column | CSV / XLSX header | Namuna / product |
|-----------|-------------------|------------------|
| `citizen_no` | `citizen_no` | Per-GP positive integer (1, 2, 3, …); unique with `gp_id`; use same value in properties as `owner_citizen_no` |
| `name_mr`, `name_en` | `name_mr`, `name_en` | Owner name (N08/N09 register text) |
| `mobile`, `ward_number`, `address_mr` | same | Citizen master (spec) |
| `aadhaar_last4`, `household_id` | optional | Citizen master |

## `gp_properties` (N08-oriented row)

| DB column | CSV / XLSX header | Notes |
|-----------|-------------------|--------|
| `property_no` | `property_no` | N08 assessment / मालमत्ता क्रमांक; unique per `gp_id` |
| `owner_citizen_no` | `owner_citizen_no` | Must match a `citizen_no` already imported for this GP |
| `survey_number`, `plot_or_gat` | optional | N08 location |
| `property_type` | `property_type` | `jhopdi_mati` … `bakhal` (see `Namuna8Property`) |
| `length_ft`, `width_ft` | optional, **feet** | `Namuna8Property.lengthFt` / `widthFt` |
| `age_bracket` | optional | `0-2` … `60+` |
| `occupant_name` | `occupant_name` | भोगवटदार |
| `resolution_ref`, `assessment_date` | optional | N08 GP resolution context; date `YYYY-MM-DD` |

**N09** demand / half-year columns are **not** in this table; future `gp_tax_demands` (or similar) should FK to `gp_properties.id`.
