---
moc: true
group: Daily Cash Chain
namune_count: 2
tags: [moc, cash, gram-panchayat, daily]
---

# MOC — Daily Cash Chain

## Overview
The cash registers are the **heartbeat of GP accounting**. Every financial transaction flows through Namuna 5 (General Cash Book). Sub-form 5क captures daily entries; N18 handles small petty expenses. These are updated every single working day.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-05]] | सामान्य रोकड वही (+ 5क) | General Cash Book + Daily | Daily | VERY HIGH |
| [[Namuna-18]] | किरकोळ रोकड वही | Petty Cash Book | Daily | MEDIUM |

## Flow Diagram

```mermaid
flowchart TD
    N07[N07 General Receipt] -->|income posted| N05[N05 सामान्य रोकड वही\nGeneral Cash Book]
    N10[N10 Tax Receipt] -->|tax income posted| N05
    N11[N11 Misc Demand] -->|misc income| N05
    N12[N12 Contingency Voucher] -->|payments posted| N05
    N21[N21 Payroll] -->|salary payment| N05
    N20[N20 Works Payment] -->|works payment| N05
    N05 -->|funds imprest| N18[N18 किरकोळ रोकड वही\nPetty Cash Book]
    N18 -->|recoupment| N05
    N05 -->|classified monthly| N06[N06 Classified Register]
    N05 -->|monthly totals| N26[N26 Monthly Returns]
    N05 -->|annual totals| N03[N03 Annual I&E]
```

## Internal Dependencies
```
N18 (Petty Cash — imprest from N5) ──→ N5 (replenishment posts back)
N5क (Daily Cash Book) ──→ N5 (weekly roll-up)
```

## Receives From (Other Groups)
- [[Namuna-07]] [[Namuna-10]] [[Namuna-11]] (Receipt group — all income)
- [[Namuna-12]] [[Namuna-21]] [[Namuna-31]] (Expenditure group — all payments)
- [[Namuna-20]] (Works — works payments)
- [[Namuna-25]] [[Namuna-29]] (Advances — investment/loan flows)

## Feeds Into (Other Groups)
- [[Namuna-06]] (Receipt — classified ledger posted from N5)
- [[Namuna-26]] (Reporting — monthly totals)
- [[Namuna-03]] (Reporting — annual totals)

## Critical Daily Rule
Cash book MUST be balanced every day. Sarpanch MUST authenticate weekly.
Unbalanced cash book = automatic major audit objection.

## Dataview Query
```dataview
TABLE name_mr, frequency, audit_risk, who_approves
FROM "Namune/Cash"
WHERE namuna > 0
SORT namuna ASC
```
