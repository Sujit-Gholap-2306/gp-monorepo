---
namuna: 11
name_en: Notice of Demand
name_mr: मागणी नोटीस
category: Tax
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Tax Defaulter
audit_risk: VERY HIGH
tags: [namuna, tax, gram-panchayat]
---

# Namuna 11 — मागणी नोटीस (Notice of Demand)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Tax | Gram Sevak | Sarpanch | As needed | Legally required to be served 15 days before any attachment proceedings can begin [VERIFY] | Tax Defaulter | VERY HIGH | MVP Act 1958 Sec 129 [VERIFY] |

## Purpose

The first stage of coercive tax recovery; a formal legal notice served to defaulters who have failed to pay Gram Panchayat taxes within the stipulated time.

## Key Fields

- Notice Number
- Date of Issue
- Name and Address of Defaulter
- Assessment Number
- Details of Arrears (Amount due)
- Notice Fee levied on the defaulter
- Deadline for payment
- Signature of Sarpanch/Gram Sevak

## Dependencies

- Depends On: [[Namuna-09]]
- Feeds Into: [[Namuna-12]]

## Validation Rules

- Must only be issued if Namuna 9 shows a positive outstanding balance beyond the statutory grace period.
- The amount demanded in the notice must equal the outstanding balance in Namuna 9 plus legally applicable notice fees.

## Audit Risk — VERY HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-09]], [[Namuna-12]]
