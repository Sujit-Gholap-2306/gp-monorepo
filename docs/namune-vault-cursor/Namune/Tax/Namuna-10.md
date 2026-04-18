---
namuna: 10
name_en: Tax and Fee Receipt Book
name_mr: कर व फी पावती
category: Tax
who_maintains: Gram Sevak
who_approves: N/A (Issued directly to citizen) [VERIFY]
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, tax, gram-panchayat]
---

# Namuna 10 — कर व फी पावती (Tax and Fee Receipt Book)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Tax | Gram Sevak | N/A (Issued directly to citizen) [VERIFY] | As needed | N/A | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

The official, legally binding counterfoil receipt issued to citizens upon their payment of property taxes, water charges, or administrative service fees.

## Key Fields

- Receipt Number (Pre-printed and sequentially numbered)
- Date of Issue
- Name of Payer
- Property/Assessment Number
- Amount Paid (Figures and Words)
- Particulars of Payment (Tax type, Arrears vs Current split)
- Signature of Receiver (Gram Sevak)

## Dependencies

- Depends On: [[Namuna-09]]
- Feeds Into: [[Namuna-05]], [[Namuna-09]], [[Namuna-32]]

## Validation Rules

- Receipt numbers must be strictly sequential; any canceled or missing numbers must be documented, preserved, and audited.
- The amount on the receipt must be posted identically to Namuna 5 (Cash Book) and Namuna 9 (Tax Collection) on the very same day.

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-09]], [[Namuna-32]]
