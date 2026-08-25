Issue 39 -- Xuezhen Huang Class Assignment (128th run, Mon 27 Jul 2026 UTC)
Reporter: KC | Area: Booking / Accomm | Sheet row: 41

SYMPTOM
Student paid for 3 weeks accommodation in Host Family (Jul 12 - Aug 2). Not appearing in class assignment.

ROOT CAUSE (fresh DB Mon 27 Jul UTC -- 128th check)
BC 24609 (Morning General, Jul 13 - Jul 31 2026): active = true, 0 student class assignments (unchanged).
Xuezhen Huang student 14443, booking 17831, EUR 570 paid.
Course ends FRIDAY 31 July 2026.
Accommodation BA 11358 (bed 180, Jul 12 - Aug 2): present, active.

Days lost: 11 school days Jul 13-27 (irrecoverable; Jul 27 AM now past).
Days remaining: 4 school days Tue Jul 28 - Fri Jul 31 (FINAL WEEK -- course ends Friday).

TIMING WARNING: Assign tonight (Mon 27 Jul) so the student appears on the Tue 28 Jul AM attendance sheet.
If assignment is made AFTER the Tue AM class starts (~08:30 UTC / 09:30 IST), student misses another day.

FIX RECIPE (NOT YET RUN)

CRITICAL -- course ends Fri 31 Jul 2026 (4 school days remain from Tue Jul 28)

Step 1 -- Assign BC 24609 to Morning General class in SIS admin:
  Navigate: SIS Admin > Students > Xuezhen Huang (14443) > Booking 17831
  Find booking course BC 24609 (Morning General, Jul 13 - Jul 31)
  Assign to the appropriate Morning General class
  weekStart = 2026-07-28 (Tuesday -- Mon Jul 27 AM already past) | weekEnd = 2026-07-31 (course end)

Step 2 -- Verify SCA created:
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24609;

Step 3 -- Confirm student appears in attendance for week of Jul 28.

RISK / CATEGORY
Category: Class assignment / attendance | Reversible: Yes | Blast radius: 1 student

STATUS: CRITICAL -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC (128th hrly) | Course ends Fri Jul 31 | ASSIGN TONIGHT
