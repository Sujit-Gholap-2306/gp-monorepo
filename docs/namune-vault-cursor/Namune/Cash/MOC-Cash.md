---
moc: true
group: Cash
namune_count: 2
tags: [moc, Cash, gram-panchayat]
---

# MOC — Cash

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Cash/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-05]] | सामान्य रोकड वही | General Cash Book | Daily | VERY HIGH |
| [[Namuna-18]] | आगाऊ रक्कम नोंदवही | Advance Register | As needed | HIGH |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Cash --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Cash"
WHERE namuna > 0
SORT namuna ASC
```
