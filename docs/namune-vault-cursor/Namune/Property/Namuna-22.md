---
namuna: 22
name_en: Dead Stock Register
name_mr: जड वस्तू नोंदवही
category: Property
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, property, gram-panchayat]
---

# Namuna 22 — जड वस्तू नोंदवही (Dead Stock Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Property | Gram Sevak | Sarpanch | As needed | N/A | Internal | MEDIUM | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Inventory log for all non-consumable, permanent assets purchased for GP administration, such as furniture, computers, and heavy machinery.

## Key Fields

- Serial Number
- Date of Purchase
- Description of Article
- Quantity
- Rate and Total Cost
- Bill Number and Vendor Name
- Location of Item
- Final Disposal/Write-off details (with GP resolution)

## Dependencies

- Depends On: [[Namuna-05]]
- Feeds Into: [[Namuna-04]]

## Validation Rules

- Every purchase logged here must have a corresponding payment entry authorized in the Cash Book (Namuna 5).
- Feeds aggregated asset data into the Annual Assets & Liabilities statement (Namuna 4).
- Items cannot be written off without a formal Gram Sabha resolution.

## Audit Risk — MEDIUM

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-04]], [[Namuna-05]]
