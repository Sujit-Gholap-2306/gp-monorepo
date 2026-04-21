---
namuna: 6
name_en: Classified Register of Receipts
name_mr: जमा वर्गीकरण वही
category: Receipt
who_maintains: Gram Sevak
who_approves: Internal
frequency: Daily
submitted_to: N/A
audit_risk: HIGH
tags: [namuna, receipt, gram-panchayat]
---

# Namuna 06 — जमा वर्गीकरण वही (Classified Register of Receipts)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Receipt | Gram Sevak | Internal | Daily | N/A | N/A | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Segregates the chronological receipt entries from the Cash Book (Namuna 5) into specific statutory accounting heads for programmatic reporting.

## Key Fields

- Date
- Namuna 5 Page/Entry Number
- Receipt Number
- Major/Minor Head of Account (e.g., Property Taxes, Water Charges, SFC Grants)
- Amount Apportioned

## Dependencies

- Depends On: [[Namuna-05]], [[Namuna-25]]
- Feeds Into: [[Namuna-03]]

## Validation Rules

- The sum total of all classified receipts for a given accounting period must exactly equal the total receipts in Namuna 5 for the same period.
- Government grant receipts must map directly to the specific scheme in the Grant Register (Namuna 25).

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-03]], [[Namuna-05]], [[Namuna-25]]
