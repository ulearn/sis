# Issue 21 — Maurivan Kuhl (BC1604 stale) | Addendum 28 Jul 2026

Reporter: AC | Area: Booking (class display) | Sheet row: 22

## Symptom
Appears in A1 AM & A2 AM WB 11/05/2026 — should only be in A2 AM.

## Root Cause
BC 1604 (Morning General, booking 1461) still active=true despite ending 3 Jul 2026 — 25 days stale.
Stale flag may cause student to appear in old course-level class assignment views.

Evidence (28 Jul 2026 UTC):
- BC 1604: Morning General, booking 1461, active=true, endDate=2026-07-03 — 25d stale

## Fix Recipe (NOT YET RUN)
UPDATE BookingCourse SET active = false WHERE id = 1604;

## Risk
Category: data-hygiene / cosmetic. Reversible: yes. Blast radius: BC 1604 only; no financial impact.

## Status
Unchanged — 25 days stale. Fix NOT RUN.
Last checked: 28 Jul 2026 UTC