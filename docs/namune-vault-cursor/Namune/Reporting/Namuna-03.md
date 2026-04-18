---
namuna: 3
name_en: Statement of Income and Expenditure
name_mr: जमा-खर्च विवरण
category: Reporting
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: Monthly
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, reporting, gram-panchayat]
---

# Namuna 03 — जमा-खर्च विवरण (Statement of Income and Expenditure)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Reporting | Gram Sevak | Sarpanch | Monthly | 5th of every subsequent month [VERIFY vs PS deadline if different] | Internal | HIGH | MVP Act 1958 Sec 8; Lekha Sanhita 2011 [VERIFY] |

## Purpose

Aggregates classified financial data to present the actual income and expenditure against the approved budget, acting as the primary monthly reporting tool.

## Key Fields

- Month and Year
- Budget Head (Receipts & Payments)
- Budgeted Amount (from Namuna 1/2)
- Actual Receipts/Expenditure for the month
- Progressive Total (Year-to-date)
- Variance (Budget vs. Progressive Total)
- Signatures of Gram Sevak and Sarpanch

## Dependencies

- Depends On: [[Namuna-01]], [[Namuna-02]], [[Namuna-06]], [[Namuna-07]]
- Feeds Into: [[Namuna-31]]

## Validation Rules

- Monthly totals must match exactly the sum of entries in Namuna 6 (Receipts) and Namuna 7 (Expenditure).
- Progressive expenditure cannot exceed the allotted budget without a valid Namuna 2 entry.
- Serves as the foundational dataset for the Annual Administration Report (Namuna 31).

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-01]], [[Namuna-02]], [[Namuna-06]], [[Namuna-07]], [[Namuna-31]]
