---
namuna: 4
name_en: Register of Assets and Liabilities
name_mr: मालमत्ता व दायित्वे
category: Reporting
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: Annual
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, reporting, gram-panchayat]
---

# Namuna 04 — मालमत्ता व दायित्वे (Register of Assets and Liabilities)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Reporting | Gram Sevak | Sarpanch | Annual | End of Financial Year | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Maintains an ongoing inventory of all movable and immovable assets owned by the GP, alongside a strict accounting of all outstanding debts and liabilities.

## Key Fields

- Asset/Liability ID
- Description of Asset/Liability
- Date of Acquisition / Creation of Liability
- Original Value
- Depreciation / Amortization parameters
- Current Book Value
- Location of Asset
- Creditor Details (for liabilities)

## Dependencies

- Depends On: [[Namuna-05]], [[Namuna-22]], [[Namuna-26]], [[Namuna-28]], [[Namuna-29]]
- Feeds Into: [[Namuna-31]]

## Validation Rules

- New capital assets must have a corresponding expenditure entry tracing back to Namuna 5 and Namuna 22.
- Current liabilities must seamlessly reconcile with the Loan Register (Namuna 26) and Deposit Register (Namuna 29).

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-22]], [[Namuna-26]], [[Namuna-28]], [[Namuna-29]], [[Namuna-31]]
