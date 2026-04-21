---
namuna: 17
name_en: Works / Tender Register
name_mr: कामांची नोंदवही / निविदा
category: Works
who_maintains: Gram Sevak
who_approves: Sarpanch / Panchayat Samiti
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, works, gram-panchayat]
---

# Namuna 17 — कामांची नोंदवही / निविदा (Works / Tender Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Works | Gram Sevak | Sarpanch / Panchayat Samiti | As needed | N/A | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

The central tracking ledger for all infrastructure and public works undertaken by the GP, chronicling the lifecycle from administrative approval to tender allocation.

## Key Fields

- Serial Number
- Name and Description of Work
- Resolution Date of Gram Sabha / GP approving the work
- Administrative Approval Details (Authority, Date, Sanctioned Amount)
- Technical Sanction Details (Authority, Date)
- Tender Notice Date and Publication Details
- Name of Contractor Awarded
- Work Order Date

## Dependencies

- Depends On: None
- Feeds Into: [[Namuna-20]], [[Namuna-29]]

## Validation Rules

- A work order cannot be recorded without a valid Gram Sabha/GP resolution and verified Technical Sanction.
- Estimated administrative cost must not exceed the approved budget provision from Namuna 1 / 2.

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-20]], [[Namuna-29]]
