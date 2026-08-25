# Issue 21 — Maurivan Kuhl (BC1604 stale)

Reporter: AC | Area: Booking | Sheet row 22 | 17th check Sun 9 Aug 2026 UTC

## Symptom
BC 1604 (Morning General, booking 1461) active despite ending 3 Jul 2026.

## Root cause
- BC 1604: endDate 2026-07-03, active = true — 37 days stale
- Booking 1461 (student 912, Maurivan Kuhl): CONFIRMED, amountPaid EUR 1,509.60, amountOpen EUR 0
- No change since Sat 8 Aug. Data-hygiene only.

## Fix recipe (NOT YET RUN)
```sql
UPDATE "BookingCourse" SET active = false WHERE id = 1604;
```
Or via SIS Admin: booking 1461 → Booking Courses → deactivate BC 1604.

## Risk
Category: data-hygiene | Reversible: yes | Blast radius: single BC row

## Status
Pending — BC 37d stale. Fix NOT RUN.
Last checked: Sun 9 Aug 2026 UTC