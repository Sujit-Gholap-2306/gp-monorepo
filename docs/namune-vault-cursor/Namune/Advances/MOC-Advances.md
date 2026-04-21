---
moc: true
group: Advances
namune_count: 3
tags: [moc, Advances, gram-panchayat]
---

# MOC — Advances

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Advances/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-17]] | कामांची नोंदवही / निविदा | Works / Tender Register | As needed | HIGH |
| [[Namuna-25]] | अनुदान नोंदवही | Grant-in-aid Register | As needed | HIGH |
| [[Namuna-29]] | अनामत नोंदवही | Register of Deposits | As needed | HIGH |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Advances --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Advances"
WHERE namuna > 0
SORT namuna ASC
```
