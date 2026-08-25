# Issue 12 — Rakan Alghamdi: SCA 288 on wrong Booking Course (175th check, 14 Aug 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 13

SYMPTOM: SCA 288 linked to Booking Course 24697 (ended Jul 31) instead of renewal BC 25035.

ROOT CAUSE (DB evidence 14 Aug 2026 ~22:00 UTC):
- Student Class Assignment 288 (Rakan Alghamdi, student 14444): class 12, bookingCourseId = 24697, weekStart = 6 Jul 2026, weekEnd = 18 Dec 2026
- Booking Course 24697 (Academic Year Morning): endDate = 31 Jul 2026, active = true — stale, 14 days past end
- Booking Course 25035 (General English Academic Year AM Plus): startDate = 3 Aug 2026, endDate = 18 Dec 2026, active = true, ilepCode = null
- SCA 288 weekEnd (18 Dec) matches BC 25035 endDate exactly — BC 25035 is the correct target
- No attendance gap: 31 Jul–3 Aug is a weekend (Sat 1 – Sun 2 Aug)
- BC 25035 has no ILEP code; BC 24697 had ilepCode = 0318/0020

FIX RECIPE (NOT YET RUN):

Step 1 — Re-link SCA 288 to BC 25035:
  SQL: UPDATE student_class_assignment SET booking_course_id = 25035 WHERE id = 288;

Step 2 — Deactivate BC 24697 (ended 31 Jul, safe after re-link):
  SQL: UPDATE booking_course SET active = false WHERE id = 24697;

Step 3 — Set ILEP code on BC 25035 (verify correct code from HubSpot deal or prior BCs):
  SQL: UPDATE booking_course SET ilep_code = '0318/0020' WHERE id = 25035;
  (Confirm code before running — BC 24697 had 0318/0020 but BC 25035 may need different code)

Step 4 — Verify attendance records for Jul 24–31 are correctly attributed after re-link.

RISK: Data — attendance linkage for 1 student. Reversible. Blast radius: Rakan Alghamdi only.

STATUS: No change since 174th check. Fix NOT RUN. 175th check.
Last checked: 2026-08-14 ~22:00 UTC