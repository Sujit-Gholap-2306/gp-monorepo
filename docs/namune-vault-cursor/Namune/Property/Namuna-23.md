---
namuna: 23
name_en: Stamp Register
name_mr: मुद्रांक नोंदवही
category: Cash
who_maintains: Gram Sevak / Clerk
who_approves: Internal
frequency: Daily
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, cash, gram-panchayat]
---

# Namuna 23 — मुद्रांक नोंदवही (Stamp Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Cash | Gram Sevak / Clerk | Internal | Daily | N/A | Internal | MEDIUM | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Tracks the purchase, usage, and exact balance of postage and revenue stamps used for official GP correspondence and legal documents. [VERIFY: official Maharashtra Namuna 23 is often roads register — source TXT differs].

## Key Fields

- Date
- Opening Balance of Stamps (Financial Value)
- Stamps Purchased (Value)
- Reference to Namuna 5 (for purchase)
- Stamps Consumed (Value)
- Details of Dispatch/Usage (Addressee)
- Closing Balance

## Dependencies

- Depends On: [[Namuna-05]]
- Feeds Into: [[Namuna-05]]

## Validation Rules

- Equation: Closing Balance = Opening Balance + Purchases - Consumption.
- Stamp purchases must perfectly map to petty cash or main cash payments in Namuna 5.

## Audit Risk — MEDIUM

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]]
