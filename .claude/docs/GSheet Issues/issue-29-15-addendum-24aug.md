# Issue 29 and 15 - Saikhantes Shagdasuren (student 1001)
Reporter: PG | Area: Booking / Class | Sheet row 30 | 490th check Mon 24 Aug 2026 UTC

## Symptom
Saikhantes has no class assignment since 3 Jul 2026. She is in school today (Mon 24 Aug). SIS cannot record attendance.

## Root Cause (verified from live DB)
- SCA 255: class 11, week_end 2026-07-03 - expired 52 days ago. No new SCA exists.
- BC 24925 (Academic Year Afternoon): active, 9 Mar to 2 Oct 2026 (39 days remaining).
- BC 1982 (Academic Year Morning): ended 19 Dec 2025, still active = true - 248 days stale.
- Booking 18151: CONFIRMED, fully paid EUR 1,339.20, service_end = 2026-08-07 (17d past; BC ends 2 Oct).

## Fix Recipe (NOT YET RUN)

1. Check holidays after Jul 3: SELECT * FROM booking_holidays WHERE booking_id = 18151 AND end_date > 2026-07-03;

2. Create new SCA (adjust week_start to return date if holiday found):
   INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end, created_at, updated_at)
   VALUES (1001, 24925, 11, 2026-07-06, 2026-10-02, NOW(), NOW());

3. Deactivate BC 1982: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1982;

4. Optionally extend service_end: UPDATE bookings SET service_end = 2026-10-02, updated_at = NOW() WHERE id = 18151;

## Risk
Category: Bookings / class assignment. Reversible. Single student. URGENCY: HIGH.

## Status
Fix NOT RUN. Last checked: 2026-08-24 UTC (490th hourly run).