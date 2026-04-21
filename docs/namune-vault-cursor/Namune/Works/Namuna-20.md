---
namuna: 20
name_en: Works chain — Estimate, Measurement Book, Work Bill
name_mr: कामाचा अंदाज / मोजमाप वही / कामाचे देयक
category: Works
who_maintains: Technical Officer / Junior Engineer / Gram Sevak [VERIFY]
who_approves: BDO / Executive Engineer / Sarpanch [VERIFY]
frequency: Per Project
submitted_to: Panchayat Samiti
audit_risk: VERY HIGH
tags: [namuna, works, gram-panchayat]
---

# Namuna 20 — कामाचा अंदाज / मोजमाप वही / कामाचे देयक (Works chain — Estimate, Measurement Book, Work Bill)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Works | Technical Officer / Junior Engineer / Gram Sevak [VERIFY] | BDO / Executive Engineer / Sarpanch [VERIFY] | Per Project | Prior to Work Order issuance / bill [VERIFY] | Panchayat Samiti | VERY HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

This note merges source **Namuna 20** (Estimate), **Namuna 20A** (Measurement Book), and **Namuna 20B** (Work Bill) because the vault layout has a single [[Namuna-20]] file.

## Key Fields

- **Estimate (20):** Name of Work; Reference to Namuna 17; Item Description; Quantity Estimated; Unit Rate (DSR); Total Estimated Cost; Contingencies; Total.
- **Measurement (20A):** Date of Measurement; Name of Work; Contractor; Item Description; Dimensions; Quantity Executed; signatures.
- **Work Bill (20B):** Bill Number and Date; Contractor; Name of Work; Value executed (from 20A); Deductions; Net payable; payee signature; passing order.

## Dependencies

- Depends On: [[Namuna-17]], [[Namuna-19]]
- Feeds Into: [[Namuna-05]], [[Namuna-07]], [[Namuna-31]]

## Validation Rules

- Unit rates must not exceed the current year's approved DSR without written justification [VERIFY].
- Total estimated cost must align with administrative approval limits in Namuna 17.
- Executed quantities cannot arbitrarily exceed estimated quantities in Namuna 20 without revised estimate [VERIFY].
- Bill value must map to Quantity (from 20A) × Approved Rate (from 20); statutory deductions before payment [source].
- Net amount must be logged in Namuna 5 and Namuna 7 once passed [source].

## Audit Risk — VERY HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-07]], [[Namuna-17]], [[Namuna-19]], [[Namuna-31]]
