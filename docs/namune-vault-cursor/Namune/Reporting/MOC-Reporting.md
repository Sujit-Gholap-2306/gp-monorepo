---
moc: true
group: Reporting
namune_count: 6
tags: [moc, Reporting, gram-panchayat]
---

# MOC — Reporting

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/Reporting/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-03]] | जमा-खर्च विवरण | Statement of Income and Expenditure | Monthly | HIGH |
| [[Namuna-04]] | मालमत्ता व दायित्वे | Register of Assets and Liabilities | Annual | HIGH |
| [[Namuna-26]] | कर्ज नोंदवही | Loan Register | As needed | HIGH |
| [[Namuna-27]] | आक्षेप पूर्तता नोंदवही | Audit Objection Compliance Register | Upon receiving audit report | HIGH |
| [[Namuna-28]] | गुंतवणूक नोंदवही | Register of Investments | As needed | MEDIUM |
| [[Namuna-30]] | लेखा आक्षेप नोंदवही | Audit Objection Register | Annual | VERY HIGH |

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in Reporting --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Reporting"
WHERE namuna > 0
SORT namuna ASC
```
