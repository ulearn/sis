# Issue 19 — Mai Lan Chu (BC89 + BC90 stale) | Addendum 28 Jul 2026

Reporter: AC | Area: Class Assignment | Sheet row: 20

## Symptom
Not appearing in class-to-be-assigned (original resolved; stale BCs remain).

## Root Cause
BC 89 and BC 90 for booking 83 are both active=true despite ending 22 May 2026 — 67 days stale.
Booking 83 CONFIRMED, fully paid EUR 2629.80/2629.80, amountOpen=0. Purely cosmetic.

Evidence (28 Jul 2026 UTC):
- BC 89: Morning IELTS, 13 Apr – 22 May 2026, active=true — 67 days stale
- BC 90: Private Lessons, 13 Apr – 22 May 2026, active=true — 67 days stale
- Booking 83: CONFIRMED, amountOpen=0, fully paid

## Fix Recipe (NOT YET RUN)
UPDATE BookingCourse SET active = false WHERE id IN (89, 90);

## Risk
Category: data-hygiene / cosmetic. Reversible: yes. Blast radius: BC 89 + 90 only; no financial impact.

## Status
Unchanged — 67 days stale. Fix NOT RUN.
Last checked: 28 Jul 2026 UTC