---
namuna: 9
name_en: Tax Demand Register
name_mr: कर मागणी नोंदवही
category: Tax
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: Annual
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, tax, gram-panchayat, demand]
---

# Namuna 9 — कर मागणी नोंदवही (Tax Demand Register)

> **Sub-form 9क — कराची मागणी पावती (Tax Demand Notice):** Printed notice-cum-receipt issued to each taxpayer. Contains demand amount, due date, and detachable receipt portion.

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Tax |
| Maintains | Gram Sevak |
| Approves | Sarpanch |
| Frequency | Annual (raised once; collections updated throughout year) |
| Deadline | Before collection cycle begins [VERIFY: GP Act deadline] |
| Submitted To | Internal |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §124 (levy) + §129 (recovery); Lekha Sanhita Ch.V [VERIFY]; GP Taxes Rules 1960 [VERIFY] |

## Purpose
Records the annual tax demand against each assessed property (from N8) and tracks collections and outstanding balances throughout the year. Core document for monitoring tax revenue performance.

## Key Fields
- Demand year; Assessment number (from N8); Taxpayer name and address
- Annual demand: house tax / water tax / other (separate columns)
- Half-year demand (April–Sep; Oct–Mar)
- Collections: 1st half (date, amount, N10 receipt number); 2nd half
- Arrears from previous year (brought forward)
- Total demand (current + arrears); total collected; outstanding
- Demand notice (9क) issued date; court stay orders; write-off references

## Dependencies
**Depends On:** [[Namuna-08]]
**Feeds Into:** [[Namuna-10]]

## Validation Rules
- Total demand = sum of annual demands in N8 (exact match required)
- Demand notice (9क) must be issued to every taxpayer — non-issuance bars recovery under §129
- Arrears brought forward = previous year's outstanding in N9
- Collections (from N10) must be posted here contemporaneously
- Outstanding = Total demand − Total collected (arithmetic check in every audit)

## Audit Risk
HIGH — Common objections:
- Demand notices (9क) not issued — recovery proceedings then legally barred
- Arrears not carried forward — real outstanding understated
- Collections not updated — outstanding appears larger than actual
- Total demand does not match N8 assessment totals

## Tax Chain Position
**[[Namuna-08]] → N9 → [[Namuna-10]]** (Assess → Demand → Collect)
