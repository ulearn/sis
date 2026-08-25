Issue 36 -- Attendance Homework Section / School Closures

Reporter: PG | Area: Attendance | Sheet row: 37 (code row)
Last checked: 2026-08-25 UTC (499th check)

SYMPTOM
Attendance sheets do not show a homework section. School closures are not checked when generating
week attendance. Staff requested: course start dates restricted to Mon/Tue after bank holidays.

ROOT CAUSE
- renderSheetHtml() lines 36-130, src/routes/attendance.ts: no homework section in rendered HTML
- getWeekAttendance(): no school_closures lookup
- G column edited multiple times (last between 497th-498th run); code diagnosis unchanged
- No spec received from Paul/Neil on homework format or closure behaviour

FIX RECIPE (NOT YET RUN)
Step 1: Await spec from Paul/Neil on homework format.
Step 2: Add homework block to renderSheetHtml() in src/routes/attendance.ts.
Step 3: Add school_closures lookup to getWeekAttendance() to flag closure weeks.

RISK: Code change. Low risk. Reversible. Blast radius: attendance sheet display only.
STATUS: Awaiting spec. Code unchanged since 24 Aug 2026.
Last checked: 2026-08-25 UTC (499th check)
