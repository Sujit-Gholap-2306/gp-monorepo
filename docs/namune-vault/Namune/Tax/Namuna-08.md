---
namuna: 8
name_en: Tax Assessment Register
name_mr: कर आकारणी नोंदवही
category: Tax
who_maintains: Gram Sevak
who_approves: Gram Panchayat (resolution)
frequency: Annual
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, tax, gram-panchayat, assessment]
---

# Namuna 8 — कर आकारणी नोंदवही (Tax Assessment Register)

> ⚠️ **Do not confuse** with the revenue/land Namuna 8 (7/12 extract). This is the GP **accounting** Tax Assessment Register.

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Tax |
| Maintains | Gram Sevak |
| Approves | GP Resolution |
| Frequency | Annual (revised for new properties/changes) |
| Deadline | Before demand cycle starts each year |
| Submitted To | Internal |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §124 (tax powers); Lekha Sanhita Ch.V [VERIFY rule]; GP Taxes Rules 1960 [VERIFY] |

## Purpose
Master register of ALL properties assessed for taxation within the GP area. Contains assessed value, tax rate, and annual demand for each property. Foundation of the entire tax chain — Namune 9 and 10 are derived from this.

## Key Fields
- Assessment number (unique, permanent)
- Property holder name; survey/plot number; location
- Property type (residential/commercial/industrial)
- Plinth area; Annual Rateable Value (ARV) [VERIFY: basis used in Maharashtra GP]
- Tax rates per type (house tax, water tax, other)
- Annual demand per tax type; total annual demand
- Date of assessment; date of last revision
- Exemptions noted with legal basis

## Dependencies
**Depends On:** *(none — starts from property survey)*
**Feeds Into:** [[Namuna-09]]

## Validation Rules
- Every property within GP limits must be assessed — omissions reduce tax revenue
- Assessment must follow prescribed valuation method — arbitrary rates objected
- Demand in N9 must exactly match annual demand per property here
- Revised assessment requires GP resolution + notice to property owner [VERIFY: notice period]
- Exempted properties must cite the legal provision (place of worship, burial ground, etc.)

## Audit Risk
HIGH — Common objections:
- Properties not assessed (omissions discovered at survey)
- Assessment not revised for many years — artificially low demands
- ARV calculation method not documented or inconsistent

## Tax Chain Position
**N8 → [[Namuna-09]] → [[Namuna-10]]** (Assess → Demand → Collect)
