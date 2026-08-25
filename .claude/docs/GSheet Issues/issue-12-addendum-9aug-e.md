Issue 12 -- Rakan Alghamdi (Student 14444): SCA 288 Mislinked
Check: 137th, Sun 9 Aug 2026 UTC (2nd today) | Reporter: AC | Row: 13

ROOT CAUSE
BC 24697 (AY Morning, 6 Jul-31 Jul 2026): active=true (9d stale).
  SCA 288 attached: classId=12, weekStart=2026-07-06, weekEnd=2026-12-18 (140d past course end).
BC 25035 (GE AY AM Plus, 3 Aug-18 Dec 2026): active=true, 0 classAssignments.
  Rakan unassigned for new term starting TOMORROW Mon 10 Aug 2026.

FIX RECIPE -- NOT YET RUN

Step 1: Deactivate BC 24697
  UPDATE BookingCourse SET active=false, updatedAt=NOW() WHERE id=24697;

Step 2: Relink SCA 288 to BC 25035 (weekStart=Aug 10; weekEnd stays Dec 18)
  UPDATE StudentClassAssignment
  SET bookingCourseId=25035, weekStart=2026-08-10, updatedAt=NOW()
  WHERE id=288;

Step 3: Verify
  SELECT id,classId,weekStart,weekEnd,bookingCourseId FROM StudentClassAssignment WHERE id=288;
  Expect: bookingCourseId=25035, weekStart=2026-08-10, weekEnd=2026-12-18
  SELECT id,active FROM BookingCourse WHERE id IN (24697,25035);
  Expect: 24697 active=false, 25035 active=true

RISK: Category=Bookings/class assignments | Reversible=Yes
Blast radius: Single student (Rakan, 14444) -- class list/attendance only
Urgency: CRITICAL -- classes start Mon 10 Aug 2026

STATUS: Open -- Fix NOT RUN | Last checked: Sun 9 Aug 2026 UTC (137th check)
