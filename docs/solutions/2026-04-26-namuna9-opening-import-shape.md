# Namuna 9 opening import — final shape

**Scope:** Phase 11 opening-balance import for tenant N09.

## Final decision

N09 opening import is **not** a receipt migration flow and **not** a demand-creation
flow anymore.

It is now:

- one Excel row per property
- four arrears inputs in wide form
- optional demand/total reference columns for operator visibility
- backend update of `previous_paise` only on already-generated current-FY N09 lines

This keeps N09 responsible for demand state and keeps N10 responsible for
collections/receipts.

## Why we changed it

The earlier row-wise format (`property_no`, `tax_head`, `arrears`, `current`, `paid`)
had two problems:

1. It looked unlike the physical register and was tiring for Gram Sevak data entry.
2. `current_year_paid_rupees` created accounting ambiguity because a non-zero paid
   amount would affect N09 totals without creating an N10 receipt trail.

The current shape fixes both:

- operators edit a format closer to paper
- paid money is explicitly pushed to N10 flow
- demand columns remain visible for checking, but backend does not trust Excel to
  rewrite generated current-year demand

## Excel shape

One row per property:

| property_no | house_arrears_rupees | house_demand_rupees | house_total_rupees | lighting_arrears_rupees | lighting_demand_rupees | lighting_total_rupees | sanitation_arrears_rupees | sanitation_demand_rupees | sanitation_total_rupees | water_arrears_rupees | water_demand_rupees | water_total_rupees |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| P-001 | 400.00 | 918.00 | 1318.00 | 0 | 25.00 | 25.00 | 0 | 25.00 | 25.00 | 0 | 360.00 | 360.00 |

Rules:

- `*_arrears_rupees` are authoritative inputs
- `*_demand_rupees` and `*_total_rupees` are reference-only
- one row per `property_no`
- values must be non-negative and max 2 decimals

## Backend behavior

Template modes:

- `blank`
- `properties`

`properties` mode is FY-aware and only includes properties that already have
generated N09 current-year demand lines. If a property is not ready, it is placed
in a `not_importable` sheet with reason.

Upload behavior:

- validates property exists
- validates current FY N09 header exists
- validates all 4 demand-lines exist
- validates lowering arrears will not break already-recorded paid amounts
- updates only `gp_namuna9_demand_lines.previous_paise`
- leaves `current_paise` unchanged
- leaves `paid_paise` unchanged

## Payment rule

Any paid migration belongs to N10, not this import.

- legacy `current_year_paid_rupees` is tolerated only if the numeric value is zero
- any non-zero paid value is rejected with instruction to use N10 receipt flow

## User-facing meaning

This import means:

"Set the old arrears opening position for already-generated current-FY N09 demand."

It does **not** mean:

- create missing N09 demand
- correct generated current-year demand from Excel
- migrate receipts
