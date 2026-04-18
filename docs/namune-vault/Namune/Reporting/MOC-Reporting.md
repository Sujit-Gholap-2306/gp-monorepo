---
moc: true
group: Reporting & Annual Accounts
namune_count: 5
tags: [moc, reporting, gram-panchayat, annual-accounts, monthly-returns]
---

# MOC — Reporting & Annual Accounts

## Overview
These five registers are the GP's **accountability output layer** — they summarise and report the financial activity recorded in all other registers. N26 is the monthly pulse; N3 and N4 are the annual financial statements; N27 and N28 are compliance monitoring registers.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-03]] | जमा-खर्च विवरण | Annual Income & Expenditure Statement | Annual | HIGH |
| [[Namuna-04]] | मत्ता व दायित्वे | Assets & Liabilities (Balance Sheet) | Annual | MEDIUM |
| [[Namuna-26]] | मासिक विवरण (26क + 26ख) | Monthly Returns (Income + Expenditure) | Monthly | HIGH |
| [[Namuna-27]] | लेखापरीक्षण आक्षेप मासिक | Audit Objections Monthly Statement | Monthly | HIGH |
| [[Namuna-28]] | SC/ST + महिला खर्च विवरण | SC/ST 15% + Women 10% Welfare Register | Monthly/Quarterly | VERY HIGH |

## Flow Diagram

```mermaid
flowchart TD
    N05[N05 Cash Book\nDaily] -->|monthly totals| N26[N26 मासिक विवरण\n26क Income + 26ख Expenditure]
    N06[N06 Classified Register] -->|head-wise totals| N26
    N21[N21 Payroll] -->|salary figures| N26
    N26 -->|by 15th of month| PS([Panchayat Samiti])
    N26 -->|PS reviews → objections| N27[N27 Audit Objections\nMonthly Statement]
    N27 -->|feeds cumulative| N30[N30 Audit Compliance\nAudit group]
    N28[N28 SC/ST + Women\nWelfare Compliance] -->|non-compliance flagged| N30
    N26 -->|12-month aggregate| N03[N03 Annual I&E\nStatement]
    N03 -->|presented at| GS([Gram Sabha])
    N03 -->|closing balance| N04[N04 Balance Sheet]
    N04 -->|presented at| GS
```

## Reporting Hierarchy
```
Daily: N5 (Cash Book) + N6 (Classified)
    ↓ Monthly aggregation
N26क (Income Return) + N26ख (Expenditure Return) — by 15th to PS
    ↓ Annual aggregation
N3 (Annual I&E Statement) + N4 (Balance Sheet) — at Gram Sabha

Audit chain:
N26 ──triggers──→ N27 (Audit Objections Monthly) ──→ N30 (Cumulative Compliance)
N28 (Welfare compliance) ──→ N30 (Audit)
```

## Key Deadlines
- N26: 15th of following month to Panchayat Samiti [VERIFY]
- N3 + N4: Annual Gram Sabha (April–June) [VERIFY]

## Dataview Query
```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Reporting"
WHERE namuna > 0
SORT namuna ASC
```
