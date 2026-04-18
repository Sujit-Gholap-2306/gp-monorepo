---
namuna: 14
name_en: Stamp Account Register
name_mr: मुद्रांक हिशोब नोंदवही
category: Staff
who_maintains: Gram Sevak
who_approves: Sarpanch (periodic physical verification)
frequency: As needed
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, staff, gram-panchayat, stamps, revenue-stamps]
---

# Namuna 14 — मुद्रांक हिशोब नोंदवही (Stamp Account Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Staff |
| Maintains | Gram Sevak |
| Approves | Sarpanch (periodic physical verification) |
| Frequency | As needed (each purchase or usage) |
| Deadline | N/A |
| Submitted To | Internal; physical count at audit |
| Audit Risk | MEDIUM |
| Legal Ref | Indian Stamp Act, 1899 (Maharashtra application); Lekha Sanhita Ch.VI [VERIFY] |

## Purpose
Tracks purchase and usage of revenue stamps at the GP office. Revenue stamps must be affixed on payment vouchers (N12) and receipts above prescribed thresholds. Stamps are quasi-cash items — accountability is mandatory.

## Key Fields
- Date; Particulars (purchase from treasury / used on document)
- Denomination (₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100 etc.)
- Quantity received (on purchase); Value received
- Quantity used; Document reference (voucher/receipt no. where used)
- Quantity balance; Value balance
- Sarpanch verification signature and date

## Dependencies
**Depends On:** *(none — starts from treasury purchase)*
**Feeds Into:** *(none — internal tracking register)*

## Validation Rules
- Physical stamp count must agree with register balance at any audit inspection
- Stamps used must reference specific document (voucher/receipt number)
- Purchases must be supported by treasury receipt/vendor bill
- GP stamps only for GP transactions — personal use is misappropriation

## Audit Risk
MEDIUM — Common objections:
- Physical stamp count does not match register balance
- Stamps used on personal documents
- Stamps purchased without treasury receipt

## Related Registers
[[Namuna-12]] Contingency Vouchers | [[Namuna-07]] General Receipt
