Issue 38 - Eduardo Roche Diaz (CRITICAL: ends Fri 14 Aug)
Reporter: AC | Area: Booking/Accomm | Sheet row: 40 | 132nd check Wed 12 Aug 2026 UTC

SYMPTOM
Booking Course 25043 (General English PM, 10-14 Aug 2026, booking 18265, student 14602) has 0 class assignments.
Course ends Friday 14 Aug. 2 school days remain. Mon/Tue/Wed attendance unrecorded.

ROOT CAUSE
Eduardo Roche Diaz (student 14602) has 4 consecutive weekly bookings in General English PM, all in Class 6 (B2&C1 PM).
First 3 weeks have class assignments; the 4th does not:

- Booking 18233 -> BC 25011 (Jul 20-24) -> SCA 358, class_id = 6 OK
- Booking 18245 -> BC 25023 (Jul 27-31) -> SCA 359, class_id = 6 OK
- Booking 18258 -> BC 25038 (Aug  3- 7) -> SCA 421, class_id = 6 OK
- Booking 18265 -> BC 25043 (Aug 10-14) -> 0 class assignments MISSING

DB confirmed: SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25043 = 0

FIX RECIPE (NOT YET RUN)

Option A - SIS UI (preferred):
  Open Booking 18265 -> Courses -> BC 25043 -> assign to Class 6 (B2&C1 PM), week 10-14 Aug 2026.

Option B - Direct DB INSERT:
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id)
  VALUES (25043, 6, '2026-08-10', '2026-08-14', 14602);
  Verify: SELECT * FROM student_class_assignments WHERE student_id = 14602 ORDER BY week_start
  Confirm class_id = 6 matches SCAs 358/359/421 before running.

RISK / CATEGORY
- Category: bookings / attendance
- Reversible: yes (DELETE inserted row if wrong)
- Blast radius: 1 class assignment for 1 student

CRITICAL
Course ends Friday 14 Aug. Mon-Wed already unrecorded.
Thursday and Friday are the last 2 school days.
Fix must run before close of business Fri 14 Aug.

STATUS
OPEN - NOT YET RUN. 132nd check. No change from 131st.

Last checked: Wed 12 Aug 2026 UTC