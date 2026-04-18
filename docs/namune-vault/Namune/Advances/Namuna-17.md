---
namuna: 17
name_en: Advances and Deposits Register
name_mr: अग्रीम / अनामत रक्कमांची नोंदवही
category: Advances
who_maintains: Gram Sevak
who_approves: Sarpanch; PS (above limit)
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, advances, gram-panchayat, deposits, security-deposit]
---

# Namuna 17 — अग्रीम / अनामत रक्कमांची नोंदवही (Advances & Deposits Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Advances |
| Maintains | Gram Sevak |
| Approves | Sarpanch; PS (above limit) [VERIFY: threshold] |
| Frequency | As needed |
| Deadline | Advances adjusted within 30 days [VERIFY: prescribed deadline] |
| Submitted To | Internal |
| Audit Risk | HIGH |
| Legal Ref | Lekha Sanhita Ch.VI [VERIFY advances rule]; MVP Act §63 [VERIFY] |

## Purpose
Tracks all temporary advances paid by the GP (to staff, contractors, suppliers) and security deposits received from contractors. Every advance must be adjusted within prescribed time; every deposit must be refunded when obligation is fulfilled.

## Key Fields
- Serial no.; Date; Name of recipient (staff/contractor/vendor)
- Nature (advance for works / travel advance / security deposit received)
- Amount; Purpose/reference (work number, purchase order)
- Due date for adjustment/refund; Amount adjusted/refunded (date, reference)
- Outstanding balance; Remarks (overdue flag, recovery action)

## Dependencies
**Depends On:** [[Namuna-05]]
**Feeds Into:** [[Namuna-04]] [[Namuna-32]]

## Validation Rules
- Advances adjusted within 30 days or prescribed period — unadjusted advances are major objections
- No second advance to person with unadjusted first advance
- Security deposits refunded after work completion + defect liability period
- Outstanding advances appear as assets in N4 (balance sheet)

## Audit Risk
HIGH — Common objections:
- Advances outstanding for years without adjustment or recovery
- Second advance given before first is adjusted
- Security deposits not refunded despite work completion

## Related Registers
[[Namuna-05]] Cash Book | [[Namuna-04]] Balance Sheet | [[Namuna-32]] Refund Orders
