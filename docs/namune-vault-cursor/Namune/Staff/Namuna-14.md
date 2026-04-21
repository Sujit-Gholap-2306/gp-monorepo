---
namuna: 14
name_en: Register of Sale of Attached Property
name_mr: विक्री नोंदवही
category: Tax
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, tax, gram-panchayat]
---

# Namuna 14 — विक्री नोंदवही (Register of Sale of Attached Property)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Tax | Gram Sevak | Sarpanch | As needed | N/A | Internal | HIGH | MVP Act 1958 Sec 129 [VERIFY] |

## Purpose

Records the administrative details and financial proceeds from the public auction of properties seized under Namuna 13.

## Key Fields

- Date of Auction
- Inventory Reference (Namuna 13)
- Description of Item Sold
- Name of Purchaser
- Sale Amount Realized
- Auctioneer Signature
- Adjustment against Tax Arrears and Fees
- Surplus Amount (if any, marked for refund)

## Dependencies

- Depends On: [[Namuna-13]]
- Feeds Into: [[Namuna-05]], [[Namuna-09]], [[Namuna-32]]

## Validation Rules

- Sale proceeds must be posted directly to the Cash Book (Namuna 5) on the day of the auction.
- Tax arrears must be marked as paid up to the amount realized, adjusting the balance in Namuna 9, with any surplus handled via Namuna 32 (Refund Order).

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-09]], [[Namuna-13]], [[Namuna-32]]
