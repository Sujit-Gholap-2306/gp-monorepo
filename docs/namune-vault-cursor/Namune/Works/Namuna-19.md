---
namuna: 19
name_en: Muster Roll
name_mr: हजेरीपट
category: Staff
who_maintains: Mukadam (Foreman) / Gram Sevak
who_approves: Gram Sevak / Inspecting Engineer
frequency: Daily
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, staff, gram-panchayat]
---

# Namuna 19 — हजेरीपट (Muster Roll)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Staff | Mukadam (Foreman) / Gram Sevak | Gram Sevak / Inspecting Engineer | Daily | End of the billing week/cycle | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

The daily attendance and wage record for daily-wage laborers employed by the GP for public works, sanitation, or emergency relief.

## Key Fields

- Name of Work / Project
- Month and Specific Dates
- Name of Laborer
- Father's/Husband's Name
- Daily Attendance Status (Present/Absent)
- Total Days Worked
- Daily Wage Rate
- Total Amount Payable
- Signature/Thumb Impression of Laborer

## Dependencies

- Depends On: None
- Feeds Into: [[Namuna-20]], [[Namuna-21]]

## Validation Rules

- Total days worked cannot mathematically exceed the days in the specified billing cycle.
- Must be physically verified and signed by the overseeing authority before processing the Namuna 21 Salary Bill or Namuna 20 bill chain.

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-20]], [[Namuna-21]]
