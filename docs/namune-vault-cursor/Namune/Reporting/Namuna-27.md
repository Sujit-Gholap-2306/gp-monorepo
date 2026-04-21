---
namuna: 27
name_en: Audit Objection Compliance Register
name_mr: आक्षेप पूर्तता नोंदवही
category: Audit
who_maintains: Gram Sevak
who_approves: Gram Sabha / Auditor
frequency: Upon receiving audit report
submitted_to: Panchayat Samiti
audit_risk: HIGH
tags: [namuna, audit, gram-panchayat]
---

# Namuna 27 — आक्षेप पूर्तता नोंदवही (Audit Objection Compliance Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Audit | Gram Sevak | Gram Sabha / Auditor | Upon receiving audit report | Compliance report typically due within 3 months of audit [VERIFY] | Panchayat Samiti | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Tracks the steps taken by the GP to rectify anomalies, correct procedural errors, or recover funds flagged during statutory financial audits.

## Key Fields

- Audit Year
- Audit Paragraph / Objection Number (from Namuna 30)
- Description of Objection
- Amount Involved for Recovery (if any)
- Action Taken by GP
- Resolution Number of Gram Sabha approving compliance
- Date of Final Settlement by Auditor

## Dependencies

- Depends On: [[Namuna-30]]
- Feeds Into: [[Namuna-30]]

## Validation Rules

- Every active objection in Namuna 30 must have a corresponding tracking row in Namuna 27.
- An objection cannot be marked "Settled" in the system without documented approval from the statutory auditor.

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-30]]
