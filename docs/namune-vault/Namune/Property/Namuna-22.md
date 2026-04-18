---
namuna: 22
name_en: Immovable Property Register
name_mr: स्थावर मालमत्ता नोंदवही
category: Property
who_maintains: Gram Sevak
who_approves: Sarpanch; CEO ZP (audit)
frequency: Updated on acquisition/construction; annual verification
submitted_to: PS (audit)
audit_risk: HIGH
tags: [namuna, property, gram-panchayat, immovable, buildings]
---

# Namuna 22 — स्थावर मालमत्ता नोंदवही (Immovable Property Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Property |
| Maintains | Gram Sevak |
| Approves | Sarpanch; CEO ZP |
| Frequency | Updated on acquisition; annual verification |
| Deadline | Annual verification report [VERIFY] |
| Submitted To | PS (audit) |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §53 [VERIFY: vesting section], §57; Lekha Sanhita Ch.VII [VERIFY] |

## Purpose
Master register of ALL immovable assets (buildings, community halls, water supply structures, drainage works) owned by the GP. Roads are in N23; land in N24. Feeds into balance sheet (N4) and annual statement (N3).

## Key Fields
- Serial no.; Property name/description; Survey/property number
- Location; Total area (plinth area for buildings, sq m)
- Date of construction/acquisition; Mode (own construction/scheme/donation/transfer)
- Original cost/value; Source of funds (own/14th FC/scheme)
- Current condition and use; Encumbrance (if any)
- Date of last physical verification; Remarks

## Dependencies
**Depends On:** [[Namuna-23]] [[Namuna-24]]
**Feeds Into:** [[Namuna-03]] [[Namuna-04]]

## Validation Rules
- Every building/structure vested in GP must be in this register
- Encumbered (mortgaged) properties must be noted
- Annual physical verification mandatory — 2+ year gap is objected
- Construction cost must reconcile with N20 (works register) for GP-constructed assets
- Properties in dilapidated condition without repair plan are flagged

## Audit Risk
HIGH — Common objections:
- Buildings constructed through government schemes not entered
- Annual verification not done
- Encroachments on GP buildings not reported/acted upon
- Value not updated after major renovation

## Related Registers
[[Namuna-23]] Roads | [[Namuna-24]] Land | [[Namuna-20]] Works | [[Namuna-04]] Balance Sheet
