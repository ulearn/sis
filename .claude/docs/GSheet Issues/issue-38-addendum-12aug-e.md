ISSUE 38 - Eduardo Roche Diaz (CRITICAL: course ends Fri 14 Aug)
Reporter: AC | Sheet row: 40 | 130th check Wed 12 Aug 2026 UTC

Symptom: BC 25043 (General English PM, Aug 10-14 2026, bk 18265, student 14602) has 0 class assignments.
Course ends Friday 14 Aug. 2 school days remain.

Root Cause:
  BC 25011 (Jul 20-24) -> SCA 356, class 6
  BC 25023 (Jul 27-31) -> SCA 359, class 6
  BC 25038 (Aug 3-7)   -> SCA 421, class 6
  BC 25043 (Aug 10-14) -> 0 class assignments (Mon-Wed attendance unrecorded)

Fix Recipe (NOT YET RUN):
  Via SIS UI: Booking 18265 -> BC 25043 -> Assign to Class 6, week 10-14 Aug.
  Or DB: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
         VALUES (25043, 6, '2026-08-10', '2026-08-14');

Risk: Bookings/Attendance - reversible. 1 SCA. Class 6 pattern clear from 3 prior weeks.
Status: OPEN - not run. CRITICAL - ends Fri 14 Aug 2026. 2 school days left.
Last checked: Wed 12 Aug 2026 UTC (130th check)