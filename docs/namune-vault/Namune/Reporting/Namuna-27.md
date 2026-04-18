---
namuna: 27
name_en: Audit Objections Monthly Statement
name_mr: लेखापरीक्षणातील आक्षेपांचे मासिक विवरण
category: Reporting
who_maintains: Gram Sevak
who_approves: Sarpanch; CEO ZP
frequency: Monthly
submitted_to: Panchayat Samiti; CEO ZP
audit_risk: HIGH
tags: [namuna, reporting, gram-panchayat, audit-objections, monthly]
---

# Namuna 27 — लेखापरीक्षणातील आक्षेपांचे मासिक विवरण (Audit Objections Monthly Statement)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Reporting |
| Maintains | Gram Sevak |
| Approves | Sarpanch; CEO ZP |
| Frequency | Monthly |
| Deadline | Monthly with N26 returns [VERIFY] |
| Submitted To | Panchayat Samiti; CEO ZP |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §64 [VERIFY]; Lekha Sanhita Ch.X [VERIFY]; Maharashtra Local Fund Accounts Act [VERIFY] |

## Purpose
Monthly monitoring register of all pending audit objections. Records each objection, action taken, and compliance status. Submitted monthly to PS alongside N26 — gives PS/CEO ZP visibility into GP's audit health.

## Key Fields
- Audit report reference no. and year; Paragraph/objection serial no.
- Nature of objection; Amount involved; Register/Namuna concerned
- Date objection raised; GP reply date and summary
- Auditor acceptance/non-acceptance; Compliance action (recovery, record produced)
- Date compliance completed; Outstanding Y/N; Remarks

## Dependencies
**Depends On:** [[Namuna-26]]
**Feeds Into:** [[Namuna-30]]

## Validation Rules
- Every objection in every audit memo must have an entry — omitting objections is itself an objection
- Compliance must be completed within prescribed period [VERIFY: time limit from audit rules]
- Recoverable amounts: recovery deposited and receipt number noted
- Long-pending objections (3+ years) escalated to CEO ZP / State Audit [VERIFY]

## Audit Risk
HIGH — Common objections:
- Objections tracked in N27 but compliance not actually done (false compliance)
- Recovery amounts recorded as "deposited" without actual deposit
- N27 not updated after audit visits for months

## Audit Chain
**Audit inspection → N27 (monthly monitoring) → [[Namuna-30]] (cumulative compliance register)**
