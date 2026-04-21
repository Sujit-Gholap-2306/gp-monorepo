---
namuna: 8
name_en: Tax Assessment Register
name_mr: कर आकारणी नोंदवही
category: Tax
who_maintains: Gram Sevak
who_approves: Gram Sabha / Sarpanch
frequency: Annual
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, tax, gram-panchayat]
---

# Namuna 08 — कर आकारणी नोंदवही (Tax Assessment Register)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Tax | Gram Sevak | Gram Sabha / Sarpanch | Annual | Prior to April 1st of the Financial Year [VERIFY] | Internal | HIGH | MVP Act 1958 Sec 124; Lekha Sanhita 2011 [VERIFY] |

## Purpose

The master demographic and property database of all structures, trades, and water connections liable for Gram Panchayat taxation, increasingly informed by SVAMITVA drone data [VERIFY: mapping to official Namuna 8].

## Key Fields

- Property/Assessment Number (Geo-tagged ID if SVAMITVA mapped)
- Name of Owner/Occupier
- Type of Property (Residential/Commercial/Open Plot)
- Capital Value / Annual Letting Value
- Rate of Tax applied
- Total Assessed General Tax
- Total Assessed Special Taxes (Water, Light, Health)
- Exemptions applied

## Dependencies

- Depends On: None
- Feeds Into: [[Namuna-09]]

## Validation Rules

- Assessed value and tax rates must strictly conform to the bylaws approved by the Zilla Parishad or State Government.
- Must not assess properties specifically exempted under MVP Act Sec 124 (e.g., certain SC/ST habitations or religious structures).

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-09]]
