Issue 35 -- PM Attendance Default Duration (3.25h to 3h)

Reporter: AC (staff)
Area: Attendance PM
Sheet row: 42

SYMPTOM
"Hi Neil, the default attendance duration for PM classes is still set to 3.25 hours instead of 3 hours. Could you please check this? Thanks"

ROOT CAUSE
File: src/scripts/attendance.ts, line 84

  const blockHours = classData.session === MORNING ? 3 : 3.25; // 09:00-12:00 or 13:45-17:00

This hardcoded constant is the default hours pre-filled when a teacher marks a PM student present.
The value 3.25 is the GROSS wall-clock time (13:45-17:00 = 3h15m).
All active PM classes carry breakMinutes=15, so NET teaching hours = 3.00h.

DB evidence (read-only, Jun 19 2026):
  class 6  B2&C1 PM  13:45-17:00  break=15min  net=3.00h
  class 9  A2 PM     13:45-17:00  break=15min  net=3.00h
  class 11 B1 PM     13:45-17:00  break=15min  net=3.00h
  class 14 C1 PM     13:45-17:00  break=15min  net=3.00h
  class 15 121(pvt)  14:00-16:00  break=0min   net=2.00h

The classes.ts financial calculator (line 1064) already does this correctly:
  const blockHours = Math.max(0, (grossMin - (cls.breakMinutes || 0)) / 60);

The attendance.ts weekly-grid loader ignores breakMinutes entirely.

FIX RECIPE  --  NOT YET RUN

Option A - Minimal (change the constant)
Edit src/scripts/attendance.ts line 84.
FROM:
  const blockHours = classData.session === MORNING ? 3 : 3.25;
TO:
  const blockHours = 3; // Both sessions 3h net (AM: 09:00-12:00; PM: 13:45-17:00 less 15m break)
Then: npm run build (from sis/)

Option B - Derive from actual class times (recommended)
1. Add startTime, endTime, breakMinutes to the class select in prisma.class.findUnique (attendance.ts line ~49)
2. Replace line 84 with:
     const [sh,sm]=(classData.startTime||09:00).split(:).map(Number);
     const [eh,em]=(classData.endTime  ||12:00).split(:).map(Number);
     const grossMin=(eh*60+em)-(sh*60+sm);
     const blockHours=Math.max(0,(grossMin-(classData.breakMinutes||0))/60);
3. npm run build from sis/

Option B matches classes.ts exactly; handles 121 (2h private) correctly too.

IMPACT OF NOT FIXING
Each PM student marked present defaults to 3.25h instead of 3.00h.
Over a school year (5d/wk, 40wk) this overstates attendance by 50h per student,
inflating ILEP percentages and hours-taught totals.

No DB changes needed -- attendance table stores hours explicitly per row.
Existing records unaffected; only new marks after fix will default to 3h.

RISK
Category: Code / Attendance
Reversible: Yes -- revert line 84 and rebuild
Blast radius: Small -- affects default pre-fill for new PM attendance marks only
Money impact: None direct; affects ILEP accuracy over time

Status: RESOLVED.
Last checked: 2026-06-24 UTC (run #7)
---
CONFIRMED FIX — Jun 24 2026 (hourly audit run #7)

attendance.ts lines 94-100 now implement Option B (derive from actual times):
  const [_sh, _sm] = (classData.startTime || '00:00').split(':').map(Number);
  const [_eh, _em] = (classData.endTime  || '00:00').split(':').map(Number);
  const _grossMin = (_eh * 60 + (_em || 0)) - (_sh * 60 + (_sm || 0));
  const blockHours = Math.max(0, (_grossMin - (classData.breakMinutes || 0)) / 60);

Old hardcode (3.25 PM / 3 AM) is GONE.
Comment at line 94 documents the original bug.
Matches classes.ts financial calculator exactly.
Sheet H updated to FIXED; K = fixed.

**Last checked: 2026-07-08 UTC (re-confirmed)** — scripts/attendance.ts L94-100 dynamic blockHours calc STILL PRESENT. Issue 35 comment at L94. Old 3.25 hardcode absent. Fix solid.
