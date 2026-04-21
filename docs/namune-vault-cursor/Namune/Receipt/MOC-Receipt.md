---
moc: true
group: Receipt
namune_count: 3
tags: [moc, Receipt, gram-panchayat]
---

# MOC — Receipt

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Receipt/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-06]] | जमा वर्गीकरण वही | Classified Register of Receipts | Daily | HIGH |
| [[Namuna-07]] | खर्च वर्गीकरण वही | Classified Register of Expenditure | Daily | HIGH |
| [[Namuna-11]] | मागणी नोटीस | Notice of Demand | As needed | VERY HIGH |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Receipt --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Receipt"
WHERE namuna > 0
SORT namuna ASC
```
