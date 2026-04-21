---
namuna: 28
name_en: Register of Investments
name_mr: गुंतवणूक नोंदवही
category: Property
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, property, gram-panchayat]
---

# Namuna 28 — गुंतवणूक नोंदवही (Register of Investments)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Property | Gram Sevak | Sarpanch | As needed | N/A | Internal | MEDIUM | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Records reserve funds, fixed deposits, or surplus GP funds invested in authorized securities or cooperative banks to generate interest.

## Key Fields

- Date of Investment
- Bank / Institution Name
- Type of Investment (FD, Bonds)
- Instrument Number
- Amount Invested
- Interest Rate & Maturity Date
- Maturity Value
- Date of Realization

## Dependencies

- Depends On: [[Namuna-05]]
- Feeds Into: [[Namuna-04]], [[Namuna-05]]

## Validation Rules

- Initial outflow of cash must map to a payment in Namuna 5.
- Active investments must feed into the Assets column of Namuna 4.
- Realized investments (principal + interest) must be returned to the Cash Book (Namuna 5) upon maturity.

## Audit Risk — MEDIUM

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-04]], [[Namuna-05]]
