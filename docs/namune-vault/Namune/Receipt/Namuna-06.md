---
namuna: 6
name_en: Classified Receipt Register
name_mr: जमा रक्कमांची वर्गीकृत नोंदवही
category: Receipt
who_maintains: Gram Sevak
who_approves: Sarpanch (monthly)
frequency: Monthly
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, receipt, gram-panchayat, classified-ledger]
---

# Namuna 6 — जमा रक्कमांची वर्गीकृत नोंदवही (Classified Receipt Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Receipt |
| Maintains | Gram Sevak |
| Approves | Sarpanch (monthly sign-off) |
| Frequency | Monthly (posted from N5) |
| Deadline | N/A — internal ledger |
| Submitted To | Internal; feeds N26क |
| Audit Risk | MEDIUM |
| Legal Ref | Lekha Sanhita Ch.IV [VERIFY rule]; MVP Act §63 [VERIFY] |

## Purpose
Posts all receipts month-by-month under each account head. Provides a running tally of actual income vs. budget provision — enabling the GP to track revenue shortfalls before year-end.

## Key Fields
- Account head number and description
- Budget provision (from N1); Revised provision (from N2)
- Monthly receipt columns (12 months: April–March)
- Cumulative receipts to date; Balance yet to be received
- Reference to receipt voucher number (N7) or cash book folio

## Dependencies
**Depends On:** [[Namuna-05]] [[Namuna-07]] [[Namuna-12]] [[Namuna-18]]
**Feeds Into:** [[Namuna-03]] [[Namuna-26]]

## Validation Rules
- Monthly total in N6 = receipt side monthly total in N5 (exact match)
- Annual cumulative in N6 = N3 total receipts at year-end
- Every receipt must have a corresponding N7 (general receipt voucher)
- Account head classification must match N1 heads — no "unclassified" receipts

## Audit Risk
MEDIUM — Common objections:
- Posting delayed by months (N6 not current)
- N6 totals not matching N5 monthly receipts
- Receipts posted under wrong account heads

## Related Registers
[[Namuna-05]] Cash Book | [[Namuna-07]] General Receipt | [[Namuna-26]] Monthly Returns | [[Namuna-03]] Annual Statement
