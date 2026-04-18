---
namuna: 10
name_en: Tax and Fee Receipt
name_mr: कर व फी बाबत पावती
category: Tax
who_maintains: Gram Sevak
who_approves: Sarpanch (periodic review)
frequency: As needed
submitted_to: Original to payer; counterfoil retained
audit_risk: HIGH
tags: [namuna, tax, gram-panchayat, collection-receipt]
---

# Namuna 10 — कर व फी बाबत पावती (Tax & Fee Receipt)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Tax |
| Maintains | Gram Sevak |
| Approves | Sarpanch (periodic) |
| Frequency | As needed (every tax payment) |
| Deadline | N/A — issued on payment |
| Submitted To | Original to payer; counterfoil in GP |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §124; Lekha Sanhita Ch.V [VERIFY rule] |

## Purpose
Official receipt issued to a taxpayer when they pay their taxes or fees. Updates the collection record in N9. Counterfoil retained by GP provides audit trail.

## Key Fields
- Receipt number (pre-printed serial); Date
- Taxpayer name; Assessment number (from N9)
- Type of tax paid (house tax / water tax / lighting tax)
- Current year demand amount; Arrears amount
- Amount paid (current); Amount paid (arrears)
- Early payment discount applied (5%) [VERIFY: discount provision]
- Late payment penalty [VERIFY: penalty rate]
- Balance remaining outstanding; Mode of payment
- Collecting officer signature; GP seal

## Dependencies
**Depends On:** [[Namuna-09]]
**Feeds Into:** [[Namuna-05]] [[Namuna-07]]

## Validation Rules
- Receipt amount must post to same day's N5 (cash book)
- Total N10 receipts must reconcile with collection columns in N9
- Receipt books must be pre-numbered — missing numbers are audit objections
- Collections deposited to bank same day or next working day [VERIFY]
- Discount/penalty applied only per legal basis — arbitrary discounts are objected

## Audit Risk
HIGH — Common objections:
- Missing receipt books (whole book unaccounted)
- Collections not deposited to bank same day
- Discount applied without entitlement
- Receipts issued without entering in N9 demand register (cash pocketed without posting)

## Tax Chain Position
**[[Namuna-08]] → [[Namuna-09]] → N10** (Assess → Demand → **Collect**)
