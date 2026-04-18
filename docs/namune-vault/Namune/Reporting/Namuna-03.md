---
namuna: 3
name_en: Annual Income and Expenditure Statement
name_mr: जमा-खर्च विवरण
category: Reporting
who_maintains: Gram Sevak
who_approves: Gram Sabha; CEO ZP (audit)
frequency: Annual
submitted_to: Gram Sabha; PS
audit_risk: HIGH
tags: [namuna, reporting, gram-panchayat, annual-accounts, income-expenditure]
---

# Namuna 3 — जमा-खर्च विवरण (Annual Income & Expenditure Statement)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Reporting |
| Maintains | Gram Sevak |
| Approves | Gram Sabha |
| Frequency | Annual (post 31 March) |
| Deadline | At annual Gram Sabha (April–June) [VERIFY: statutory deadline] |
| Submitted To | Gram Sabha; copy to PS |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §8 (accounts before Gram Sabha); §8(1A) (six-monthly report); Lekha Sanhita Ch.IX [VERIFY rule] |

## Purpose
Annual financial statement consolidating total receipts and expenditure for the financial year by account head. The GP's primary accountability document — presented to Gram Sabha. Foundation of the annual audit.

## Key Fields
- Financial year; Account head (number + description)
- Budget provision (from N1); Revised provision (from N2)
- Actual receipts during year; Actual expenditure during year
- Surplus or deficit per head; Opening balance; Closing balance
- Total receipts and total expenditure (foot totals)
- Gram Sabha date + resolution no.; Certifications

## Dependencies
**Depends On:** [[Namuna-02]] [[Namuna-05]] [[Namuna-06]] [[Namuna-16]] [[Namuna-22]] [[Namuna-25]] [[Namuna-26]] [[Namuna-28]]
**Feeds Into:** *(none — terminal document submitted to Gram Sabha)*

## Validation Rules
- Total receipts = N26क 12-month cumulative (exact match)
- Total expenditure = N26ख 12-month cumulative (exact match)
- Closing balance = opening balance of next year's N1
- SC/ST 15% and women 10% actuals (from N28) must be reflected
- Cannot be presented to Gram Sabha if N5 is not balanced and closed for the year

## Audit Risk
HIGH — Common objections:
- Totals not reconciling with N5 / N26
- Not presented to Gram Sabha (statutory violation)
- Presented before books are properly closed
- Closing balance not matching N4 (balance sheet)

## Annual Account Chain
**N5 + N6 + N26 → N3 (Annual Statement) → Gram Sabha**

## Related Registers
[[Namuna-05]] Cash Book | [[Namuna-26]] Monthly Returns | [[Namuna-04]] Balance Sheet | [[Namuna-28]] Welfare Expenditure
