---
moc: true
group: Property
namune_count: 5
tags: [moc, Property, gram-panchayat]
---

# MOC — Property

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Property/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-16]] | कोंडवाडा पावती | Cattle Pound Receipt | As needed | MEDIUM |
| [[Namuna-22]] | जड वस्तू नोंदवही | Dead Stock Register | As needed | MEDIUM |
| [[Namuna-23]] | मुद्रांक नोंदवही | Stamp Register | Daily | MEDIUM |
| [[Namuna-24]] | सामग्री नोंदवही | Stock Register for Consumables | As needed | MEDIUM |
| [[Namuna-33]] | इतर नोंदवही (किंवा सामान्य नोंदवही) | General / Miscellaneous Register | As needed | MEDIUM |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Property --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Property"
WHERE namuna > 0
SORT namuna ASC
```
