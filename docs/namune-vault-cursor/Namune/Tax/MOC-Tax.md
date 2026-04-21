---
moc: true
group: Tax
namune_count: 3
tags: [moc, Tax, gram-panchayat]
---

# MOC — Tax

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Tax/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-08]] | कर आकारणी नोंदवही | Tax Assessment Register | Annual | HIGH |
| [[Namuna-09]] | कर मागणी व वसुली नोंदवही | Tax Demand and Collection Register | Daily | VERY HIGH |
| [[Namuna-10]] | कर व फी पावती | Tax and Fee Receipt Book | As needed | HIGH |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Tax --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Tax"
WHERE namuna > 0
SORT namuna ASC
```
