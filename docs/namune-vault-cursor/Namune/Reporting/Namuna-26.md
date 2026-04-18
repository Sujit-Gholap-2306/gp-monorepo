---
namuna: 26
name_en: Loan Register
name_mr: कर्ज नोंदवही
category: Advances
who_maintains: Gram Sevak
who_approves: Gram Sabha / Zilla Parishad
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, advances, gram-panchayat]
---

# Namuna 26 — कर्ज नोंदवही (Loan Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Advances | Gram Sevak | Gram Sabha / Zilla Parishad | As needed | N/A | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Tracks long-term borrowings made by the GP from banks or the Zilla Parishad, including principal and interest repayment schedules. [VERIFY: official Namuna 26 is often monthly PS return — source TXT uses loan register at 26].

## Key Fields

- Date of Loan
- Source of Loan
- Purpose of Loan
- Total Amount Sanctioned
- Rate of Interest
- Repayment Schedule (EMI details)
- Principal Repaid
- Interest Paid
- Outstanding Balance

## Dependencies

- Depends On: [[Namuna-05]]
- Feeds Into: [[Namuna-04]], [[Namuna-05]]

## Validation Rules

- Inflow of loan principal must be logged as a receipt in Namuna 5.
- Outflow of EMI (Principal + Interest) must be logged as an expenditure in Namuna 5.
- The outstanding principal must reflect accurately in the Liabilities section of Namuna 4.

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-04]], [[Namuna-05]]
