---
namuna: 11
name_en: Miscellaneous Demand Register
name_mr: किरकोळ मागणी नोंदवही
category: Receipt
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, receipt, gram-panchayat, miscellaneous-income]
---

# Namuna 11 — किरकोळ मागणी नोंदवही (Miscellaneous Demand Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Receipt |
| Maintains | Gram Sevak |
| Approves | Sarpanch |
| Frequency | As needed (rents periodically; fines/fees on occurrence) |
| Deadline | N/A |
| Submitted To | Internal |
| Audit Risk | MEDIUM |
| Legal Ref | MVP Act §57 (GP powers), §124 (fees/rents); Lekha Sanhita Ch.V [VERIFY] |

## Purpose
Records demands and collections for all non-tax income: market rents, GP property lease rents, fines, fees (birth/death certificates, building permissions, etc.). Separate from the main tax demand chain (N8–N10).

## Key Fields
- Serial number; Date of demand; Name of person liable
- Nature of demand (market rent / lease rent / fine / fee / other)
- Property / purpose; Period of demand (if rent: monthly/annual)
- Amount demanded; Amount collected (date, N7 receipt number)
- Balance outstanding; Remarks (waivers, disputes)

## Dependencies
**Depends On:** *(none — starts from lease agreements, fines imposed by resolution)*
**Feeds Into:** [[Namuna-05]] [[Namuna-07]]

## Validation Rules
- Every demand must have a legal basis (resolution, lease agreement, or statutory provision)
- Collection receipt issued via N7 (general receipt) and posted to N5
- Outstanding demands not pursued for 3+ years are audit-flagged [VERIFY: limitation provision]
- Rents must be periodically revised — unchanged rents for many years are observations

## Audit Risk
MEDIUM — Common objections:
- Long-outstanding miscellaneous demands with no recovery action taken
- Market rents not revised despite lease agreement renewal
- Fines collected but not receipted

## Related Registers
[[Namuna-05]] Cash Book | [[Namuna-07]] General Receipts
