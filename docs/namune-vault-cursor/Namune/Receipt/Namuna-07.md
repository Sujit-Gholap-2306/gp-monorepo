---
namuna: 7
name_en: Classified Register of Expenditure
name_mr: खर्च वर्गीकरण वही
category: Receipt
who_maintains: Gram Sevak
who_approves: Internal
frequency: Daily
submitted_to: N/A
audit_risk: HIGH
tags: [namuna, receipt, gram-panchayat]
---

# Namuna 07 — खर्च वर्गीकरण वही (Classified Register of Expenditure)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Receipt | Gram Sevak | Internal | Daily | N/A | N/A | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Segregates the chronological payment entries from the Cash Book (Namuna 5) into specific accounting heads to monitor budget utilization against Namuna 1.

## Key Fields

- Date
- Namuna 5 Page/Entry Number
- Voucher Number
- Major/Minor Head of Account (e.g., Public Works, Salaries, Admin, Sanitation)
- Amount Apportioned

## Dependencies

- Depends On: [[Namuna-05]], [[Namuna-18]], [[Namuna-20]], [[Namuna-21]]
- Feeds Into: [[Namuna-03]]

## Validation Rules

- The sum total of all classified expenditures for a given period must exactly equal the total payments in Namuna 5 for the same period.
- Capital work expenditures must reference specific Namuna 20 bill entries, preventing generalized bulk expenses [VERIFY: 20B folded under Namuna-20].

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-03]], [[Namuna-05]], [[Namuna-18]], [[Namuna-20]], [[Namuna-21]]
