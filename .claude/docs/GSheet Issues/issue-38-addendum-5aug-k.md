# Issue 38 — Addendum 5 Aug 2026 (k): BC25004 + BC25005 Still Unassigned — 29th Check
Reporter: Diego/Paul | Area: Holidays, Bookings, Classes | Sheet row: 40

29th check Wed 5 Aug 2026 UTC.

## Symptom
Booking Courses 25004 (Vincenzo Contu) and 25005 (Claudia Mereu) start Monday 10 Aug 2026 with 0 class assignments. Deadline: Friday 7 Aug 2026 (2 days).

## Root Cause (verified live DB, 29th check)
- BC 25004: Vincenzo Contu (student 14597), General English AM Plus, 10–14 Aug 2026, active=true, SCAs=0
- BC 25005: Claudia Mereu (student 14598), General English AM, 10–14 Aug 2026, active=true, SCAs=0
Previously resolved (26th check): BC 88 (Africa Mera Bachir) and BC 25038 (Eduardo Roche Diaz), week 3–7 Aug — both assigned.

## Fix Recipe (NOT YET RUN)
Step 1 — BY FRI 7 AUG: SIS admin → Classes → To Be Assigned → BC 25004 → assign to General English AM Plus class, week Mon 10 Aug.
Step 2 — BY FRI 7 AUG: SIS admin → Classes → To Be Assigned → BC 25005 → assign to General English AM class, week Mon 10 Aug.
Fallback SQL (NOT YET RUN):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start_date, week_end_date)
  VALUES (25004, <class_id_plus>, '2026-08-10', '2026-08-14');
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start_date, week_end_date)
  VALUES (25005, <class_id_am>, '2026-08-10', '2026-08-14');

## Risk
Category: Bookings / Classes | Severity: HIGH — students start Mon 10 Aug without class | Reversible: Yes

## Status
PENDING — NOT YET RUN | Last checked: Wed 5 Aug 2026 UTC (29th check)