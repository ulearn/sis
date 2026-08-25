# Issue 15 -- Saikhantes Shagdarsuren | Row 16 | 421st run

Reporter: AC / staff | Area: Booking / Class | Sheet row: 16

## Symptom
No class assignment for Saikhantes for Aug-Oct 2026. Returns Tue 25 Aug.

## Root Cause (Thu 20 Aug 2026, 421st run / 189th check)
- BC 24925 (AY Afternoon, booking 18151): active, ends 2 Oct 2026 -- correct
- BC 1982 (AY Morning): active, ended Dec 2025 -- 244 days stale
- SCA 255: class 11, week_end 3 Jul 2026 -- expired 48 days ago (last SCA ever)
- Current/future SCAs: [] -- ZERO
- Returns Tue 25 Aug 2026 -- 2 SCHOOL DAYS remaining (Fri 21 + Mon 24 Aug) -- CRITICAL

## Fix Recipe -- NOT YET RUN

Step 1 -- Create SCA on BC 24925:
  Neil/AC to confirm class_id for PM AY Afternoon (was class 11).
  Confirm exact week_start (week of 24 Aug or backdate to Jul 6).
  NOT YET RUN:
    INSERT INTO student_class_assignments
      (student_id, booking_course_id, class_id, week_start, week_end)
    VALUES (1001, 24925, <class_id>, 2026-07-07, 2026-10-02);

Step 2 -- Deactivate BC 1982 (stale AY Morning, ended Dec 2025):
  NOT YET RUN:
    UPDATE booking_courses SET active = false WHERE id = 1982;

## Risk
Bookings/academic -- SCA insert reversible. BC deactivate reversible.

## Status
OPEN -- 189th check. 2 school days left before return Tue 25 Aug. Fix NOT RUN.
Last checked: 2026-08-20 UTC (421st run)