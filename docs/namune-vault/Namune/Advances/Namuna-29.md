---
namuna: 29
name_en: Loan Register
name_mr: कर्जाची नोंदवही
category: Advances
who_maintains: Gram Sevak
who_approves: GP Resolution; PS/CEO ZP (above GP limit)
frequency: As needed
submitted_to: Internal; PS (disclosure)
audit_risk: MEDIUM
tags: [namuna, advances, gram-panchayat, loans, borrowings]
---

# Namuna 29 — कर्जाची नोंदवही (Loan Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Advances |
| Maintains | Gram Sevak |
| Approves | GP Resolution; PS/CEO ZP (above limit) [VERIFY] |
| Frequency | As needed (loan receipt + each repayment) |
| Deadline | Repayments per sanction schedule |
| Submitted To | Internal; PS (disclosure) |
| Audit Risk | MEDIUM |
| Legal Ref | MVP Act §62 [VERIFY: loan powers]; Lekha Sanhita Ch.VI [VERIFY] |

## Purpose
Records all loans taken by the GP from government, PS, ZP, banks, or other sources. Tracks disbursement, repayment schedule, interest, and outstanding balance. Long-term borrowings are GP liabilities appearing in N4 (balance sheet).

## Key Fields
- Loan serial no.; Date of sanction; Lender name (PS/ZP/bank/scheme)
- Purpose; Sanctioned amount; Amount disbursed (date, N5 reference)
- Rate of interest; Repayment schedule (instalment, frequency, total instalments)
- Each instalment paid (date, amount, N5 reference)
- Interest paid (separately tracked); Outstanding principal and interest balance
- Remarks (prepayment, restructuring)

## Dependencies
**Depends On:** *(none — starts from loan sanction letter)*
**Feeds Into:** [[Namuna-04]] [[Namuna-05]]

## Validation Rules
- Loan receipt must be posted to N5 (cash book) immediately
- Repayments must be made per schedule — defaults create liability objections
- Interest calculations verified against lender statements annually
- Total outstanding in N29 must equal loan liability in N4
- Loans taken without GP resolution are unauthorised — major objection

## Audit Risk
MEDIUM — Common objections:
- Loan repayments in default for months
- Interest calculations incorrect or not tracked
- Loan not appearing in N4 balance sheet as liability

## Related Registers
[[Namuna-04]] Balance Sheet | [[Namuna-05]] Cash Book
