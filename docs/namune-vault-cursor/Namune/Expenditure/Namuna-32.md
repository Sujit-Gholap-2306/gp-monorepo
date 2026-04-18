---
namuna: 32
name_en: Refund Order
name_mr: परतावा आदेश
category: Receipt
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, receipt, gram-panchayat]
---

# Namuna 32 — परतावा आदेश (Refund Order)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Receipt | Gram Sevak | Sarpanch | As needed | N/A | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Formal authorization for refunding excess taxes collected, surplus auction proceeds, or erroneously credited fees back to citizens.

## Key Fields

- Date of Order
- Name of Payee
- Original Receipt Number (Namuna 10) or Tax Register Reference (Namuna 9)
- Reason for Refund
- Amount to be Refunded
- Signature of Sarpanch

## Dependencies

- Depends On: [[Namuna-09]], [[Namuna-10]], [[Namuna-14]]
- Feeds Into: [[Namuna-05]]

## Validation Rules

- A refund cannot exceed the original amount paid in Namuna 10/Namuna 9.
- The approved order acts as a voucher to authorize an expenditure payout in the Cash Book (Namuna 5).

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-09]], [[Namuna-10]], [[Namuna-14]]
