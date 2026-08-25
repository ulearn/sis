Issue 39 -- Xuezhen Huang Class Assignment (127th run, Mon 27 Jul 2026 UTC)
Reporter: KC | Area: Booking / Accomm | Sheet row: 41

SYMPTOM
Student paid for 3 weeks accommodation in Host Family (Jul 12 - Aug 2). Not appearing in class assignment.

ROOT CAUSE (fresh DB Mon 27 Jul UTC -- 127th check)
BC 24609 (Morning General, Jul 13 - Jul 31 2026): active = true, 0 student class assignments (unchanged).
Xuezhen Huang student 14443, booking 17831, EUR 570 paid.
Course ends FRIDAY 31 July 2026.
Accommodation BA 11358 (bed 180, Jul 12 - Aug 2): present, active.

Days lost: 10 school days Jul 13-24 (irrecoverable).
Days remaining: 5 school days Mon Jul 27 - Fri Jul 31 (FINAL WEEK -- course ends Friday).

FIX RECIPE (NOT YET RUN)

CRITICAL -- course ends Fri 31 Jul 2026 (5 school days remain as of Mon 27 Jul)

Step 1 -- Assign BC 24609 to Morning General class in SIS admin:
  Navigate: SIS Admin > Students > Xuezhen Huang (14443) > Booking 17831
  Find booking course BC 24609 (Morning General, Jul 13 - Jul 31)
  Assign to the appropriate Morning General class
  weekStart = 2026-07-27 (this week) | weekEnd = 2026-07-31 (course end)

Step 2 -- Verify SCA created:
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24609;

Step 3 -- Confirm student appears in attendance for week of Jul 27.

RISK / CATEGORY
Category: Class assignment / attendance | Reversible: Yes | Blast radius: 1 student

STATUS: CRITICAL -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC (127th hrly) | Course ends Fri Jul 31