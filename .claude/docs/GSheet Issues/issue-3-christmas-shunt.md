# Issue 3 — School Holidays AY: Christmas Shunt System
Reporter: (system requirement) · Area: Booking/Holidays · Sheet row 4

## Symptom
System must enforce Christmas holiday break for all AY Bookings via new shunt system (no split courses)

## Root Cause
Was a feature requirement: AY bookings that span Christmas were previously split (Fidelo legacy).
Need: single course with end date pushed forward by Christmas weekdays = no split, no manual entry.

## Implementation — DONE
File: src/scripts/christmas-shunt.ts
Entry: applyChristmasClosures(prisma, bookingId) exported and called from src/routes/webhooks.ts:1340
  — fires on every deal-WON webhook for AY/LifePass family courses

SchoolClosure Christmas records defined (as of Jun 06):
  id=7  Christmas 2026: 2026-12-21 – 2027-01-03
  id=8  Christmas 2027: 2027-12-20 – 2028-01-04
  id=9  Christmas 2028: 2028-12-18 – 2029-01-02
  id=10 Christmas 2029: 2029-12-24 – 2030-01-06

Behaviour:
  - Matches courses with name matching /academic year|life ?pass/i OR isRenewal=true
  - For each Christmas closure overlapping a course, counts weekdays and shunts endDate forward
  - Creates BookingHoliday(type=school) record — idempotent (re-run safe)
  - Iterates for multi-year bookings (LifePass spans 2-3 Christmases)

Evidence of working: bk84 has school holiday id=2428, Dec 2026, weekdaysPushed=10 (correct: 10 weekdays in 2026-12-21..2027-01-03)

## Fix Recipe
NOTHING TO DO — already implemented and live.

## Risk
None — feature complete.

## Status
FIXED · Last checked 2026-06-06

## Note on sheet data
Row 4 (issue 3) previously had H/I/K overwritten with Mohammed Ibrahim Alsaidalani data (issue 4).
That was a bot write error. H/I/K corrected to reflect actual Christmas shunt status on Jun 06.