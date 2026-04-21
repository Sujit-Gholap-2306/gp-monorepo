---
namuna: 24
name_en: Stock Register for Consumables
name_mr: सामग्री नोंदवही
category: Property
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: As needed
submitted_to: Internal
audit_risk: MEDIUM
tags: [namuna, property, gram-panchayat]
---

# Namuna 24 — सामग्री नोंदवही (Stock Register for Consumables)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Property | Gram Sevak | Sarpanch | As needed | N/A | Internal | MEDIUM | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Manages the inventory of consumable items (e.g., stationery, cleaning supplies, bleaching powder, street light bulbs) purchased by the GP.

## Key Fields

- Date
- Description of Item
- Opening Balance
- Quantity Received
- Reference to Vendor Bill / Namuna 5
- Quantity Issued
- Name of Receiver/Location (e.g., Ward 3 Streetlights)
- Closing Balance

## Dependencies

- Depends On: [[Namuna-05]]
- Feeds Into: [[Namuna-05]]

## Validation Rules

- Stock received must map to a financial payment recorded in Namuna 5.
- Stock cannot be issued in excess of the available physical balance.

## Audit Risk — MEDIUM

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]]
