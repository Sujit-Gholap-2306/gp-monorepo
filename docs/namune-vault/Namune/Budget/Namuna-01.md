---
namuna: 1
name_en: Annual Budget Estimate
name_mr: अर्थसंकल्प
category: Budget
who_maintains: Gram Sevak
who_approves: Gram Sabha / Panchayat Samiti
frequency: Annual
submitted_to: Panchayat Samiti
audit_risk: VERY HIGH
tags: [namuna, budget, gram-panchayat, lekha-sanhita]
---

# Namuna 1 — अर्थसंकल्प (Annual Budget Estimate)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Budget |
| Maintains | Gram Sevak |
| Approves | Gram Sabha → Panchayat Samiti |
| Frequency | Annual |
| Deadline | 31 Jan (Gram Sabha); 28 Feb (PS) [VERIFY] |
| Submitted To | Panchayat Samiti |
| Audit Risk | **VERY HIGH** |
| Legal Ref | MVP Act §61 [VERIFY]; Lekha Sanhita Ch.III [VERIFY rule no.] |

## Purpose
Estimates all GP income and expenditure for the coming financial year head-by-head. No expenditure is lawful against a head without provision here except via re-appropriation (Namuna 2).

## Key Fields
- Financial year; Account head (number + description)
- Opening balance; Estimated receipts; Estimated expenditure
- Revised estimate (if mid-year revision needed)
- Actual receipts / expenditure (filled at year-end for comparison)
- Resolution numbers (GP + Gram Sabha + PS approval dates)

## Dependencies
**Depends On:** *(none — foundational register)*
**Feeds Into:** [[Namuna-02]] [[Namuna-12]] [[Namuna-20]] [[Namuna-28]]

## Validation Rules
- Total estimated expenditure ≤ total estimated receipts + opening balance
- All expenditure entries in N5/N12 must have a budget head provision here
- Revised estimate needs GP resolution + PS sanction
- Must be placed before Gram Sabha **before** submission to PS

## Audit Risk
VERY HIGH — Common objections:
- Expenditure incurred against heads with no provision
- Budget submitted to PS without prior Gram Sabha approval
- Revised estimates made without formal resolution

## Related Registers
[[Namuna-02]] Re-appropriation | [[Namuna-12]] Contingency Vouchers | [[Namuna-20]] Works | [[Namuna-28]] Welfare Expenditure
