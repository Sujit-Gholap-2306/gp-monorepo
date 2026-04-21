---
moc: true
group: Receipt & Income
namune_count: 3
tags: [moc, receipt, gram-panchayat, income]
---

# MOC — Receipt & Income

## Overview
These registers capture non-tax income: the classified ledger (N6), the general receipt voucher (N7), and the miscellaneous demand register (N11) for rents and fees. All income eventually flows through N7 into N5.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
| [[Namuna-06]] | वर्गीकृत जमा नोंदवही | Classified Receipt Register | Monthly | MEDIUM |
| [[Namuna-07]] | सामान्य पावती | General Receipt Voucher | As needed | HIGH |
| [[Namuna-11]] | किरकोळ मागणी नोंदवही | Miscellaneous Demand Register | As needed | MEDIUM |

## Flow Diagram

Full-screen flowchart: **[[Receipt-Flow]]**

## Flow
```
N11 (misc collections) ──→ N7 (receipt issued) ──→ N5 (cash book)
N10 (tax receipts) ──────→ N7 ──────────────────→ N5
N7 ──posts monthly──→ N6 (classified by account head)
N6 ──feeds──→ N26 (monthly return) ──→ N3 (annual statement)
```

## Key Rule
No money acknowledged without a receipt from N7. Receipts in strict serial order.
Missing serial numbers in N7 = immediate audit red flag.

## Dataview Query
```dataview
TABLE name_mr, frequency, audit_risk, who_approves
FROM "Namune/Receipt"
WHERE namuna > 0
SORT namuna ASC
```
