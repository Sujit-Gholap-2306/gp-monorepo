---
moc: true
group: Works
namune_count: 2
tags: [moc, Works, gram-panchayat]
---

# MOC — Works

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Works/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-19]] | हजेरीपट | Muster Roll | Daily | HIGH |
| [[Namuna-20]] | कामाचा अंदाज / मोजमाप वही / कामाचे देयक | Works chain — Estimate, Measurement Book, Work Bill | Per Project | VERY HIGH |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Works --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Works"
WHERE namuna > 0
SORT namuna ASC
```
