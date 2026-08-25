Issue 12 - Rakan Alghamdi Class Assignment (Addendum 9 Aug j)

Last checked: 2026-08-09 UTC (144th hourly check)

SYMPTOM
Rakan BC 25035 started 7 days ago (3 Aug 2026), still 0 SCAs. SCA 288 still linked to ended BC 24697.

ROOT CAUSE confirmed 9 Aug 2026

- booking_courses id=25035: General English Academic Year AM (Plus), start_date=2026-08-03, end_date=2026-12-18, active=true, 0 SCAs
- student_class_assignments id=288: booking_course_id=24697 (old), class_id=12, week_start=2026-07-06 -- not on new BC
- booking_courses id=24697: end_date=2026-07-31, active=true -- ended 10 days ago, not deactivated

FIX RECIPE - NOT YET RUN

CRITICAL: Complete before Mon 10 Aug 09:00.

Step 1: Deactivate BC 24697
SQL (NOT RUN): UPDATE booking_courses SET active = false WHERE id = 24697;
Expected: active=false, end_date=2026-07-31

Step 2: Relink SCA 288 to BC 25035
SQL (NOT RUN): UPDATE student_class_assignments SET booking_course_id = 25035, week_start = DATE [2026-08-10] WHERE id = 288;
Note: week_start = 2026-08-10 (Monday, first full week of new BC)
Expected: booking_course_id=25035, week_start=2026-08-10

Rollback: UPDATE student_class_assignments SET booking_course_id=24697, week_start=DATE[2026-07-06] WHERE id=288; + set active=true on BC 24697

Step 3: Confirm in SIS Admin
Rakan booking: BC 25035 should show 1 class assignment (class_id=12).

RISK
- Category: bookings / class assignments
- Reversible: yes
- Blast radius: Rakan only; attendance unrecordable from 3 Aug without fix

STATUS
CRITICAL - fix NOT RUN. Last checked: 2026-08-09 UTC (144th check, day 7 since BC 25035 start)