---
namuna: 18
name_en: Petty Cash Book
name_mr: किरकोळ रोकड वही
category: Cash
who_maintains: Gram Sevak
who_approves: Sarpanch (weekly review)
frequency: Daily
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, cash, gram-panchayat, petty-cash]
---

# Namuna 18 — किरकोळ रोकड वही (Petty Cash Book)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Cash |
| Maintains | Gram Sevak |
| Approves | Sarpanch (weekly) |
| Frequency | Daily (as petty expenses occur) |
| Deadline | N/A — internal |
| Submitted To | Internal; feeds N5 on replenishment |
| Audit Risk | MEDIUM |
| Legal Ref | Lekha Sanhita Ch.IV [VERIFY: petty cash rule + threshold amount] |

## Purpose
Records small incidental expenses below the prescribed threshold (e.g., ₹500 per transaction [VERIFY]). Operates on an imprest basis — fixed float drawn from Namuna 5 and replenished periodically. Avoids clogging the main cash book with trivial entries.

## Key Fields
- Date; Particulars; Purpose / account head; Amount paid
- Cumulative total paid; Imprest balance remaining
- Voucher/chit number; Recipient signature
- Replenishment date and amount (drawn from N5)

## Dependencies
**Depends On:** [[Namuna-05]]
**Feeds Into:** [[Namuna-05]] [[Namuna-06]]

## Validation Rules
- Individual payments must not exceed prescribed limit [VERIFY: from Lekha Sanhita]
- Splitting large expenses into multiple petty payments to avoid the limit is prohibited
- Imprest balance = Float − cumulative payments since last replenishment
- Each petty expense must have a voucher/chit
- Replenishment from N5 must be vouched with a contingency voucher (N12)

## Audit Risk
MEDIUM — Common objections:
- Petty cash limit exceeded without sanction
- Expenses split to circumvent the limit ("splitting" objection)
- Imprest not replenished — running balance in deficit

## Related Registers
[[Namuna-05]] Main Cash Book | [[Namuna-06]] Classified Register | [[Namuna-12]] Contingency Vouchers
