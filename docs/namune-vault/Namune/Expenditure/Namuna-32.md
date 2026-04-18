---
namuna: 32
name_en: Refund Order Register
name_mr: रकमेच्या परताव्यासाठीचा आदेश नोंदवही
category: Expenditure
who_maintains: Gram Sevak
who_approves: Sarpanch; GP resolution (for larger refunds)
frequency: As needed
submitted_to: Internal
audit_risk: LOW
tags: [namuna, expenditure, gram-panchayat, refund]
---

# Namuna 32 — रकमेच्या परताव्यासाठीचा आदेश (Refund Order Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Expenditure |
| Maintains | Gram Sevak |
| Approves | Sarpanch; GP resolution above threshold [VERIFY] |
| Frequency | As needed |
| Deadline | N/A |
| Submitted To | Internal |
| Audit Risk | LOW |
| Legal Ref | Lekha Sanhita Ch.VI [VERIFY]; MVP Act §63 [VERIFY] |

## Purpose
Records all refund orders issued by the GP — for overpaid amounts, returned advances, excess security deposits, or amounts collected in error. Every refund requires a formal written order before payment from the cash book.

## Key Fields
- Order number (serial); Date; Payee name
- Reason for refund (excess tax / advance returned / deposit refundable / payment error)
- Original amount received by GP (N7 receipt reference)
- Amount to be refunded; GP resolution reference (if applicable)
- Date of payment; Mode (cash/cheque); N5 folio reference
- Payee signature on receipt of refund

## Dependencies
**Depends On:** [[Namuna-17]]
**Feeds Into:** [[Namuna-04]] [[Namuna-05]]

## Validation Rules
- Refund must have supporting original receipt (N7) showing amount was received by GP
- Payment only after formal GP order — no ad-hoc refunds from cash
- Refund of excess tax requires cross-check against N9/N10 records
- Refund reduces corresponding liability in N4 (balance sheet)

## Audit Risk
LOW — Common objections:
- Refunds paid without formal order
- Excess tax refunded without verifying against demand/collection records
- Refund to incorrect party

## Related Registers
[[Namuna-17]] Advances & Deposits | [[Namuna-04]] Balance Sheet | [[Namuna-05]] Cash Book
