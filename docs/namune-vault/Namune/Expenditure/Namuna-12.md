---
namuna: 12
name_en: Contingency Expenditure Voucher
name_mr: आकस्मित खर्चाचे प्रमाणक
category: Expenditure
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal (filed with cash book)
audit_risk: VERY HIGH
tags: [namuna, expenditure, gram-panchayat, voucher, contingency]
---

# Namuna 12 — आकस्मित खर्चाचे प्रमाणक (Contingency Expenditure Voucher)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Expenditure |
| Maintains | Gram Sevak |
| Approves | Sarpanch |
| Frequency | As needed (every contingency payment) |
| Deadline | N/A — contemporaneous with payment |
| Submitted To | Internal; filed with cash book |
| Audit Risk | VERY HIGH |
| Legal Ref | Lekha Sanhita Ch.VI [VERIFY rule]; MVP Act §63 [VERIFY] |

## Purpose
Authorised payment voucher for all contingency (day-to-day operational) expenditure. Each payment requires a separate signed voucher with original bill/invoice attached, approved before disbursement. Primary source document for all cash payments except payroll and works bills.

## Key Fields
- Voucher number (serial per financial year); Date; Payee name
- Nature of expenditure; Account head (from N1); Budget provision available
- Amount (figures and words); Supporting bills listed
- Revenue stamp affixed if applicable; GP resolution reference (if required)
- Gram Sevak certification; Sarpanch approval signature
- Payee acknowledgment signature / thumb impression

## Dependencies
**Depends On:** [[Namuna-01]]
**Feeds Into:** [[Namuna-05]] [[Namuna-06]] [[Namuna-15]]

## Validation Rules
- No payment without budget provision in N1 — expenditure on non-existent head is illegal
- Revenue stamp required on vouchers above ₹5,000 [VERIFY: current threshold]
- Payments above ₹2,000 by cheque only [VERIFY: current GR limit]
- Original bills/invoices required — no payment on photocopies
- Vouchers numbered serially without gaps
- GP resolution required for expenditure above prescribed limit [VERIFY: limit]
- Payee acknowledgment mandatory on every voucher

## Audit Risk
VERY HIGH — Most common fraud register:
- Payments without bills (fabricated vouchers)
- No Sarpanch approval signature
- Cash payments above cheque limit
- Revenue stamp missing on qualifying vouchers
- Voucher number gaps indicating destroyed vouchers
- Payments to fictitious payees

## Related Registers
[[Namuna-01]] Budget | [[Namuna-05]] Cash Book | [[Namuna-06]] Classified | [[Namuna-15]] Consumables Store
