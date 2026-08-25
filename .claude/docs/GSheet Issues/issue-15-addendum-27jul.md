Issue 15 -- Saikhantes Shagdarsuren SCA Expired (123rd run, Mon 27 Jul 2026 UTC)
Reporter: PG | Area: Booking / Class | Sheet row: 16

SYMPTOM
Course dates and holidays make no sense. Class assignment gap before holiday.

ROOT CAUSE (fresh DB Mon 27 Jul UTC)
Student 1001 Saikhantes Shagdarsuren.
BC 24925 (Academic Year Afternoon, Mar 9 - Oct 2 2026): active = true.
SCA 255 (class 11 Afternoon B1, BC 24925): weekStart=2026-01-12, weekEnd=2026-07-03 -- EXPIRED 24 days ago.
Only 1 SCA on BC 24925. No new SCA from Aug 24 created yet.

Holiday booking 2500: Jul 20 - Aug 21 2026 (5 weeks). Student returns Mon Aug 24.
Missed weeks before holiday: Jul 6 and Jul 13 (irrecoverable, SCA window closed before holiday).

New SCA required: weekStart = 2026-08-24, weekEnd = 2026-10-02, classId = 11.

FIX RECIPE (NOT YET RUN)

Step 1 -- Create new SCA for student 1001 returning Aug 24:
  In SIS Admin > Classes > Class 11 (Afternoon B1) > Assignments:
  Add student class assignment:
    student_id = 1001
    class_id = 11
    booking_course_id = 24925
    week_start = 2026-08-24
    week_end = 2026-10-02

  Or via DB (NOT YET RUN):
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end)
  VALUES (1001, 11, 24925, date:2026-08-24, date:2026-10-02);

Step 2 -- Verify after inserting:
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24925;

TIMING: No urgency this week (student on holiday until Aug 21). Action needed by Mon Aug 24.

RISK / CATEGORY
Category: Class assignment | Reversible: Yes | Blast radius: 1 student

STATUS: OPEN -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC | Action by Aug 24