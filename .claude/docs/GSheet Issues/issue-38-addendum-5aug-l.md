Issue 38 — BC 25004 + BC 25005 Class Assignment (30th check) — URGENT DEADLINE FRI 7 AUG 2026
Reporter: staff | Area: Holidays / Bookings | Sheet row: 40 | Checked: Wed 5 Aug 2026 UTC

DEADLINE: Fri 7 Aug 2026 — 2 DAYS FROM NOW

SYMPTOM
BCs 25004 and 25005 start Mon 10 Aug 2026. Still ZERO class assignments after 30 checks.

ROOT CAUSE — live data Wed 5 Aug 2026 UTC
  BC 25004: Vincenzo Contu, General English AM Plus, 10 to 14 Aug 2026, SCAs=0
  BC 25005: Claudia Mereu, General English AM, 10 to 14 Aug 2026, SCAs=0
Both students start Monday 10 Aug. Assignments must be in before Fri 7 Aug for attendance sheets.

FIX RECIPE (NOT YET RUN)

Via SIS admin UI:
  1. Open BC 25004 (Vincenzo Contu, AM Plus, Aug 10-14) — assign to correct AM Plus class
  2. Open BC 25005 (Claudia Mereu, AM, Aug 10-14) — assign to correct AM class

Via script (confirm class IDs first):
  p.classAssignment.createMany({ data: [
    { bookingCourseId: 25004, classId: AM_PLUS_CLASS_ID, weekStart: new Date("2026-08-10"), weekEnd: new Date("2026-08-14") },
    { bookingCourseId: 25005, classId: AM_CLASS_ID, weekStart: new Date("2026-08-10"), weekEnd: new Date("2026-08-14") },
  ]})

RISK: bookings (operational — students cannot attend without SCA). Reversible: yes.
STATUS: URGENT — deadline Fri 7 Aug 2026. Fix NOT RUN. Last checked: Wed 5 Aug 2026 UTC (30th hourly run)