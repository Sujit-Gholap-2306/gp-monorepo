---
namuna: 29
name_en: Register of Deposits
name_mr: अनामत नोंदवही
category: Advances
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, advances, gram-panchayat]
---

# Namuna 29 — अनामत नोंदवही (Register of Deposits)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Advances | Gram Sevak | Sarpanch | As needed | N/A | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Tracks security deposits and earnest money deposits (EMD) collected from contractors, ensuring they are held in trust and accurately refunded or forfeited.

## Key Fields

- Date of Receipt
- Name of Depositor (Contractor/Bidder)
- Tender/Work Reference (Namuna 17)
- Amount of Deposit
- Cash Book (Namuna 5) Receipt Reference
- Date of Refund or Forfeiture
- Cash Book (Namuna 5) Payment Reference (for refund)

## Dependencies

- Depends On: [[Namuna-05]], [[Namuna-17]]
- Feeds Into: [[Namuna-04]], [[Namuna-05]]

## Validation Rules

- Deposits must be logged as receipts in Namuna 5.
- Unrefunded deposits represent a liability and must feed into Namuna 4.
- Refunds must map to a payment in Namuna 5 and be authorized by the Sarpanch.

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-04]], [[Namuna-05]], [[Namuna-17]]
