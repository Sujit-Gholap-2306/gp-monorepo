---
moc: true
group: Expenditure
namune_count: 4
tags: [moc, Expenditure, gram-panchayat]
---

# MOC — Expenditure

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Expenditure/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-12]] | जप्ती वॉरंट | Warrant of Attachment | As needed | VERY HIGH |
| [[Namuna-21]] | वेतन देयक | Salary Bill | Monthly | HIGH |
| [[Namuna-31]] | वार्षिक प्रशासन अहवाल | Annual Administration Report | Annual | VERY HIGH |
| [[Namuna-32]] | परतावा आदेश | Refund Order | As needed | HIGH |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Expenditure --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Expenditure"
WHERE namuna > 0
SORT namuna ASC
```
