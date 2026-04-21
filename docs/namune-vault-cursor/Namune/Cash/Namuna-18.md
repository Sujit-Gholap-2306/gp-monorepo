---
namuna: 18
name_en: Advance Register
name_mr: आगाऊ रक्कम नोंदवही
category: Advances
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, advances, gram-panchayat]
---

# Namuna 18 — आगाऊ रक्कम नोंदवही (Advance Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Advances | Gram Sevak | Sarpanch | As needed | Advances must typically be adjusted within one month [VERIFY] | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Tracks all temporary cash advances paid to staff, contractors, or elected representatives for official purposes, ensuring timely adjustment or recovery. [VERIFY: official Namuna 18 is often petty cash book — source TXT uses different numbering].

## Key Fields

- Date of Advance
- Name and Designation of Recipient
- Purpose of Advance
- Amount of Advance
- GP Resolution Number approving the advance
- Date of Adjustment / Recovery
- Cash Book (Namuna 5) Reference for adjustment

## Dependencies

- Depends On: [[Namuna-05]]
- Feeds Into: [[Namuna-05]], [[Namuna-07]], [[Namuna-21]]

## Validation Rules

- A new advance cannot legally be issued to an individual who possesses a prior unadjusted advance.
- The initial payout must be perfectly linked to a Namuna 5 payment entry.
- Adjustment requires the submission of physical bills, linking the final expenditure to Namuna 7 and refunding any unspent balance to Namuna 5.

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-07]], [[Namuna-21]]
