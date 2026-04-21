---
moc: true
group: Staff
namune_count: 3
tags: [moc, Staff, gram-panchayat]
---

# MOC — Staff

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Staff/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-13]] | जप्त केलेल्या मालमत्तेची यादी | Inventory of Attached Property | As needed | HIGH |
| [[Namuna-14]] | विक्री नोंदवही | Register of Sale of Attached Property | As needed | HIGH |
| [[Namuna-15]] | कोंडवाडा नोंदवही | Cattle Pound Register | Daily | MEDIUM |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Staff --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Staff"
WHERE namuna > 0
SORT namuna ASC
```
