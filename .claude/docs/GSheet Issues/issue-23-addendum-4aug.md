# Issue 23 — Enshi Lu — Backwards Course Dates (addendum 4 Aug 2026)
Reporter: (legacy) | Area: Bookings | Sheet row: 24

## Symptom
Multiple stale booking courses; BC 828 has backwards start/end dates (DST migration bug).

## Root cause
4th check (Tue 4 Aug 2026 UTC) — unchanged.

- Booking 787 (student 397 Enshi Lu): CONFIRMED, confirmed = true, fully paid EUR 2147.50 — student has left

BC 826 ended 2025-11-28: 249 days stale, fee = null
BC 827 ended 2026-01-30: 186 days stale, fee = null
BC 828 start 2026-03-02 end 2026-02-27: BACKWARDS DATES (DST migration bug)
BC 829 ended 2026-06-05: 60 days stale

## Fix recipe (NOT YET RUN)
1. Fix BC 828 backwards dates (verify correct dates manually first):
   UPDATE booking_course SET start_date=2026-02-02, end_date=2026-03-27 WHERE id=828;
   (Example only — confirm correct dates against original booking record before running)
2. Deactivate all 4 stale booking courses:
   UPDATE booking_course SET active = false WHERE id IN (826, 827, 828, 829);
## Risk / category
data-hygiene. Low priority — student has left. Reversible. Blast radius: 1 student.
## Status
Open — 249 days max staleness. Backwards dates on BC 828. Fix NOT RUN.
## Last checked (UTC)
Tue 4 Aug 2026