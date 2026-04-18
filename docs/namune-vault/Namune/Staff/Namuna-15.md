---
namuna: 15
name_en: Consumables and Stationery Store Register
name_mr: उपभोग्य वस्तुसाठा नोंदवही
category: Staff
who_maintains: Gram Sevak
who_approves: Sarpanch (periodic stock verification)
frequency: As needed
submitted_to: Internal
audit_risk: LOW-MEDIUM
tags: [namuna, staff, gram-panchayat, stores, stationery, consumables]
---

# Namuna 15 — उपभोग्य वस्तुसाठा नोंदवही (Consumables Store Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Staff |
| Maintains | Gram Sevak |
| Approves | Sarpanch (stock verification) |
| Frequency | Updated on each purchase or issue |
| Deadline | N/A |
| Submitted To | Internal; physical stock verified at audit |
| Audit Risk | LOW-MEDIUM |
| Legal Ref | Lekha Sanhita Ch.VII (Stores) [VERIFY rule] |

## Purpose
Tracks receipt and consumption of office consumables (stationery, cleaning materials, printer supplies, etc.) purchased by the GP. Ensures consumables expenditure is accountable and stock is not misused.

## Key Fields
- Article description; Unit of measurement
- Opening balance (quantity)
- Date of purchase; Quantity received; Supplier name and N12 voucher number
- Quantity issued (date, purpose, authorisation)
- Closing balance (quantity); Rate per unit; Value of balance in hand

## Dependencies
**Depends On:** [[Namuna-12]]
**Feeds Into:** *(none — internal inventory register)*

## Validation Rules
- Physical stock count must agree with register balance — excess/deficit is objected
- Each issue must be authorised — un-authorised issues indicate misuse
- Purchases without supporting invoice (from N12) must not be entered

## Audit Risk
LOW-MEDIUM — Common objections:
- Physical stock count does not match register
- Consumables purchased in bulk without corresponding usage justification
- Issues not authorised

## Related Registers
[[Namuna-12]] Contingency Vouchers (purchase source)
