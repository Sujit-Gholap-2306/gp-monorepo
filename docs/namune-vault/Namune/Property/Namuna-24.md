---
namuna: 24
name_en: Land Register
name_mr: जमिनीची नोंदवही
category: Property
who_maintains: Gram Sevak
who_approves: Sarpanch; Tehsildar (revenue records)
frequency: Updated on acquisition/transfer/use change
submitted_to: Internal; Tehsildar (revenue record updates)
audit_risk: HIGH
tags: [namuna, property, gram-panchayat, land, gairan, gochar]
---

# Namuna 24 — जमिनीची नोंदवही (Land Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Property |
| Maintains | Gram Sevak |
| Approves | Sarpanch; Tehsildar [VERIFY] |
| Frequency | Updated on acquisition, transfer, or use change |
| Deadline | N/A |
| Submitted To | Internal; Tehsildar for revenue record entries |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §53 [VERIFY]; Maharashtra Land Revenue Code 1966; Lekha Sanhita Ch.VII [VERIFY] |

## Purpose
Records all land parcels owned or vested in the GP — gram sabha land (gairan/gochar), GP-purchased land, and lands transferred from government. Basis for N22 (structures on such land) and N33 (trees on such land).

## Key Fields
- Survey number / Gat number; Village/location
- Total area (Hectares + Gunthas); Classification (gairan/gochar/GP land/gram sabha land)
- Revenue record reference (7/12 extract reference); Date of acquisition
- Mode of acquisition (purchase/government transfer/court order); Title document reference
- Encumbrances; Current use (playground/burial ground/school plot/open land)
- Structures on land (→N22); Trees on land (→N33)
- Remarks (encroachments, disputes, court cases)

## Dependencies
**Depends On:** *(none — starts from revenue records)*
**Feeds Into:** [[Namuna-04]] [[Namuna-22]] [[Namuna-33]]

## Validation Rules
- All GP land must be in revenue records (7/12) in GP name — land without clear title is audit risk
- Encroachments must be reported and acted on — unresolved encroachments for years are major objections
- Gairan/gochar land converted to other use must have government sanction
- Land values in N4 (balance sheet) must be traceable to entries here

## Audit Risk
HIGH — Common objections:
- GP land encroached upon without action taken
- Land in GP possession not reflected in 7/12 (no revenue record)
- Gram sabha land illegally alienated or diverted

## Related Registers
[[Namuna-22]] Immovable Property | [[Namuna-33]] Tree Register | [[Namuna-04]] Balance Sheet
