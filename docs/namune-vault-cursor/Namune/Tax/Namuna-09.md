---
namuna: 9
name_en: Tax Demand and Collection Register
name_mr: कर मागणी व वसुली नोंदवही
category: Tax
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: Daily
submitted_to: Internal
audit_risk: VERY HIGH
tags: [namuna, tax, gram-panchayat]
---

# Namuna 09 — कर मागणी व वसुली नोंदवही (Tax Demand and Collection Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Tax | Gram Sevak | Sarpanch | Daily | N/A | Internal | VERY HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Tracks the real-time financial demand (current and arrears) for each taxpayer, alongside the collections made during the year, highlighting defaulters.

## Key Fields

- Property/Assessment Number
- Name of Assessee
- Arrears Demand (carried forward)
- Current Year Demand (from Namuna 8)
- Total Demand
- Collection (Segmented by Current vs Arrears)
- Receipt Number (Namuna 10 reference)
- Date of Payment
- Outstanding Balance
- Remission/Write-off authorized by Gram Sabha

## Dependencies

- Depends On: [[Namuna-08]], [[Namuna-10]], [[Namuna-14]]
- Feeds Into: [[Namuna-10]], [[Namuna-11]], [[Namuna-31]], [[Namuna-32]]

## Validation Rules

- Current demand must equal the total assessed tax calculated in Namuna 8.
- Every collection entry must map to a unique and valid Namuna 10 receipt number.
- Equation: Total Collection + Outstanding Balance + Remission must perfectly equal Total Demand.

## Audit Risk — VERY HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-08]], [[Namuna-10]], [[Namuna-11]], [[Namuna-14]], [[Namuna-31]], [[Namuna-32]]
