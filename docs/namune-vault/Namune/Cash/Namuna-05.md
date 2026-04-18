---
namuna: 5
name_en: General Cash Book
name_mr: सामान्य रोकड वही
category: Cash
who_maintains: Gram Sevak
who_approves: Sarpanch (weekly authentication)
frequency: Daily
submitted_to: Internal
audit_risk: VERY HIGH
tags: [namuna, cash, gram-panchayat, primary-book, daily]
---

# Namuna 5 — सामान्य रोकड वही (General Cash Book)

> **Sub-form 5क — दैनिक रोकड वही (Daily Cash Book):** Maintained day-by-day; transactions entered same day; weekly reconciliation into N5.

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Cash |
| Maintains | Gram Sevak |
| Approves | Sarpanch (weekly signature) |
| Frequency | Daily (5क); weekly reconcile (5) |
| Deadline | N/A — internal |
| Submitted To | Internal; audit inspection |
| Audit Risk | VERY HIGH |
| Legal Ref | Lekha Sanhita Ch.IV [VERIFY rule]; MVP Act §63 [VERIFY] |

## Purpose
Central financial register for ALL GP receipts and payments. The primary book of account. Every other financial register is derived from or reconciles with this book. Sub-form 5क captures same-day entries; N5 is the weekly/monthly rolled-up book.

## Key Fields
- Date; Receipt side: Particulars, Voucher no., Account head, Bank col., Cash col.
- Payment side: Particulars, Cheque/Voucher no., Account head, Bank col., Cash col.
- Daily closing balance (cash in hand + bank)
- Weekly Sarpanch authentication (signature + date)
- Monthly carry-forward balance

## Dependencies
**Depends On:** [[Namuna-07]] [[Namuna-10]] [[Namuna-11]] [[Namuna-12]] [[Namuna-18]] [[Namuna-20]] [[Namuna-21]] [[Namuna-25]] [[Namuna-29]] [[Namuna-31]] [[Namuna-32]]
**Feeds Into:** [[Namuna-03]] [[Namuna-06]] [[Namuna-26]]

## Validation Rules
- Cash book MUST be balanced (struck) every day — unbalanced books = major audit objection
- Cash in hand per books must agree with physical count at any time
- No erasures or overwriting — corrections by striking through with attestation
- Cheque required for payments above ₹2,000 [VERIFY: current GR threshold]
- Revenue stamp on payment vouchers above ₹5,000 [VERIFY: Stamp Act threshold]
- Bank deposits within 24 hours of cash receipt [VERIFY]
- Monthly closing balance must agree with N26 monthly totals
- Sarpanch weekly authentication mandatory — absence is audit objection

## Audit Risk
VERY HIGH — Most common primary fraud/objection register:
- Cash book not balanced daily
- Erasures / overwriting to conceal misappropriation
- Sarpanch authentication missing for weeks
- Cash in hand exceeds prescribed safe custody limit
- Payments without corresponding vouchers
- Backdated entries discovered at audit

## Related Registers
[[Namuna-07]] Receipts | [[Namuna-12]] Contingency Vouchers | [[Namuna-06]] Classified Ledger | [[Namuna-26]] Monthly Returns | [[Namuna-03]] Annual Statement
