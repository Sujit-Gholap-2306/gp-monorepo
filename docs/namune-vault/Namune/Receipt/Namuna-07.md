---
namuna: 7
name_en: General Receipt Voucher
name_mr: सामान्य पावती
category: Receipt
who_maintains: Gram Sevak
who_approves: Sarpanch (periodic review)
frequency: As needed
submitted_to: Original to payer; counterfoil retained by GP
audit_risk: HIGH
tags: [namuna, receipt, gram-panchayat, voucher]
---

# Namuna 7 — सामान्य पावती (General Receipt Voucher)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Receipt |
| Maintains | Gram Sevak |
| Approves | Sarpanch (above threshold) [VERIFY: amount] |
| Frequency | As needed (every receipt transaction) |
| Deadline | N/A — issued on money receipt |
| Submitted To | Original to payer; counterfoil in bound book |
| Audit Risk | HIGH |
| Legal Ref | Lekha Sanhita Ch.IV [VERIFY rule]; MVP Act §63 [VERIFY] |

## Purpose
Primary receipt issued for EVERY amount received by the GP (except tax-specific receipts which use N10). Every receipt must be from this pre-numbered bound book. The counterfoil is the GP's proof of the transaction.

## Key Fields
- Receipt number (pre-printed serial); Date
- Name of payer; Amount (figures and words)
- Purpose / account head; Mode (cash/cheque/DD)
- Cheque/DD number and bank (if applicable)
- Gram Sevak signature; GP seal
- Counterfoil: same data retained in book; cancellation note if cancelled

## Dependencies
**Depends On:** [[Namuna-10]] [[Namuna-11]] [[Namuna-33]]
**Feeds Into:** [[Namuna-05]] [[Namuna-06]]

## Validation Rules
- No cash may be acknowledged without issuing a receipt from this book
- Receipts must be in strict serial order — missing numbers are objections
- Cancelled receipts: both parts (original + counterfoil) preserved with "CANCELLED" across
- Total of counterfoils must reconcile with N5 receipt entries
- Unauthorized blank receipt books = major fraud risk

## Audit Risk
HIGH — Common objections:
- Missing receipt numbers in serial sequence
- Counterfoils defaced or pages torn
- Receipts issued without entering in cash book (misappropriation indicator)
- Two receipt books in use simultaneously

## Related Registers
[[Namuna-05]] Cash Book | [[Namuna-06]] Classified Register | [[Namuna-10]] Tax Receipts | [[Namuna-11]] Misc Demand
