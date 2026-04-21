---
moc: true
group: Audit
namune_count: 2
tags: [moc, audit, gram-panchayat]
---

# MOC — Audit

## Overview

Audit-facing registers in this Cursor draft vault live under **Namune/Reporting/** as **[[Namuna-27]]** (compliance tracking) and **[[Namuna-30]]** (objection master). This root MOC gives a single entry point for audit workflows without moving those notes (folder layout matches the 45-file spec).

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-27]] | आक्षेप पूर्तता नोंदवही | Audit Objection Compliance Register | Upon receiving audit report | HIGH |
| [[Namuna-30]] | लेखा आक्षेप नोंदवही | Audit Objection Register | Annual (Post-Audit) | VERY HIGH |

## Flow / Dependencies

```
[[Namuna-31]] (annual report) --> audit --> [[Namuna-30]] (objections) --> [[Namuna-27]] (compliance) --> closure
```

## Key Rules

- Every open row in **[[Namuna-30]]** should have a matching action row in **[[Namuna-27]]** [VERIFY].
- Do not mark settled without auditor documentation [source TXT].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/Reporting"
WHERE namuna = 27 OR namuna = 30
SORT namuna ASC
```
