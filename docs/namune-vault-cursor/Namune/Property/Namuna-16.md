---
namuna: 16
name_en: Cattle Pound Receipt
name_mr: कोंडवाडा पावती
category: Receipt
who_maintains: Pound Keeper / Gram Sevak
who_approves: N/A (Issued directly) [VERIFY]
frequency: As needed
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, receipt, gram-panchayat]
---

# Namuna 16 — कोंडवाडा पावती (Cattle Pound Receipt)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Receipt | Pound Keeper / Gram Sevak | N/A (Issued directly) [VERIFY] | As needed | N/A | Internal | MEDIUM | Lekha Sanhita 2011 [VERIFY] |

## Purpose

The counterfoil receipt issued to an owner paying fines and fees to release their impounded animal, or to a purchaser at a cattle auction.

## Key Fields

- Receipt Number
- Date of Issue
- Reference Number from Namuna 15
- Name of Payer
- Amount Paid (Split into Fine + Feeding charges)
- Signature of Receiver

## Dependencies

- Depends On: [[Namuna-15]]
- Feeds Into: [[Namuna-05]]

## Validation Rules

- Must directly cross-reference an active, unresolved entry in Namuna 15.
- Collected funds must be deposited and logged into the General Cash Book (Namuna 5) immediately.

## Audit Risk — MEDIUM

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-15]]
