# Issue 12 — Rakan Alghamdi (SCA on wrong Booking Course)
Reporter: AC | Area: Booking | Row 13 | 179th check Sun 16 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 16 Aug 2026):
- Student Class Assignment 288 (Rakan Alghamdi, student 14444): class 12, week start 6 Jul 2026, week end 18 Dec 2026
  — assigned to Booking Course 24697 (wrong)
- Booking Course 24697 (Academic Year Morning): ended 31 Jul 2026 — 16 days stale, active, 1 class assignment (SCA 288)
- Booking Course 25035 (General English Academic Year AM Plus): 3 Aug to 18 Dec 2026, active, 0 class assignments
  — correct target for SCA 288

FIX RECIPE (NOT YET RUN):
1. Move SCA 288 from BC 24697 to BC 25035:
   UPDATE student_class_assignments SET booking_course_id = 25035 WHERE id = 288;
2. Deactivate BC 24697 (no remaining class assignments):
   UPDATE booking_course SET active = false WHERE id = 24697;

RISK: Data hygiene / booking; reversible. Blast radius: 1 class assignment, 2 booking courses.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sun 16 Aug 2026 UTC (179th check)
