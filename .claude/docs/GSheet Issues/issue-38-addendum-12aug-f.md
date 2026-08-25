# Issue 38 - Eduardo Roche Diaz (CRITICAL: ends Fri 14 Aug)
Reporter: AC | Area: Booking/Accomm | Sheet row: 40 | 131st check Wed 12 Aug 2026 UTC

Symptom: BC 25043 (General English PM, 10-14 Aug 2026, bk 18265, student 14602): 0 class assignments.
Course ends Fri 14 Aug. 2 school days remain. Mon-Wed attendance unrecorded.

Root Cause:
  Prior 3 consecutive weeks all in Class 6 (B2+C1 PM):
  BC 25011 (Jul 20-24) -> CA 356, class 6
  BC 25023 (Jul 27-31) -> CA 359, class 6
  BC 25038 (Aug  3- 7) -> CA 421, class 6
  BC 25043 (Aug 10-14) -> 0 class assignments (missing)
  DB query: booking_course_id=25043 in class_assignments = 0 rows.

Fix Recipe (NOT YET RUN):
  Option A - SIS UI (preferred):
    Booking 18265 -> Courses -> BC 25043 -> Assign to Class 6, week 10-14 Aug 2026.
  Option B - direct DB INSERT:
    INSERT INTO class_assignments (booking_course_id, class_id, week_start, week_end)
    VALUES (25043, 6, 2026-08-10, 2026-08-14);
    Verify class_id=6 against CAs 356/359/421 before running.

Risk: Attendance/bookings. Reversible (DELETE if wrong). Blast radius: 1 SCA.
CRITICAL: ends Fri 14 Aug. 3 days already unrecorded. 2 school days left.

Status: OPEN - NOT YET RUN. 131st check. Fix required before Fri close of business.
Last checked: Wed 12 Aug 2026 UTC