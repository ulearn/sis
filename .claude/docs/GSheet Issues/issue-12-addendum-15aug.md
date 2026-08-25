# Issue 12 — Rakan Alghamdi: SCA 288 on wrong Booking Course (178th check, 15 Aug 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 13

## Symptom
Student Class Assignment 288 linked to ended Booking Course 24697 instead of renewal Booking Course 25035.

## Root cause (verified 15 Aug 2026 UTC)
- Student Class Assignment 288 (Rakan Alghamdi, student 14444): class 12, bookingCourseId = 24697, weekStart = 6 Jul 2026, weekEnd = 18 Dec 2026
- Booking Course 24697 (Academic Year Morning): endDate = 31 Jul 2026, active = true — 15 days past end
- Booking Course 25035 (General English Academic Year AM Plus): startDate = 3 Aug 2026, endDate = 18 Dec 2026, active = true, ilepCode = null
- SCA 288 weekEnd (18 Dec) matches BC 25035 endDate exactly — BC 25035 is the correct target
- No attendance gap: 31 Jul–3 Aug was a weekend (Sat 1 – Sun 2 Aug)
- BC 25035 has no ILEP code; BC 24697 had ilepCode = 0318/0020

No change from 175th check (Fri 14 Aug). BC 24697 now 15 days past its end.

## Fix recipe (NOT YET RUN)

Step 1 — Re-link SCA 288 to BC 25035:
  SQL: UPDATE student_class_assignments SET booking_course_id = 25035 WHERE id = 288;

Step 2 — Deactivate BC 24697 (ended 31 Jul, safe after re-link):
  SQL: UPDATE booking_courses SET active = false WHERE id = 24697;

Step 3 — Set ILEP code on BC 25035 (verify correct code from HubSpot deal or registrar first):
  SQL: UPDATE booking_courses SET ilep_code = '0318/0020' WHERE id = 25035;
  (Confirm this is still the correct code — BC 24697 had 0318/0020 but renewal may differ)

Step 4 — Verify attendance records for week starting 3 Aug 2026 attribute to BC 25035 after re-link.

## Risk / category
Data — attendance linkage for 1 student. Reversible. Blast radius: Rakan Alghamdi only.

## Status: OPEN — no change since 177th check. BC 24697 now 15d stale. Fix NOT RUN.
Last checked: 2026-08-15 UTC (178th check)