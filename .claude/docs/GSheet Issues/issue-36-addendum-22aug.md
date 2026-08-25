# Issue 36 (a) Addendum 22 Aug 2026 — Attendance Sheets Homework Section

Reporter: (staff) | Area: Attendance sheets | Sheet row: 37

Root cause (code check 47, Sat 22 Aug 2026 UTC — no changes since check 46 Fri 21 Aug):

Bug A — Homework block absent:
  renderSheetHtml() in src/routes/attendance.ts (lines 36–120) generates the HTML
  attendance sheet but contains no homework section. Paul confirmed it should be included.
  Status: awaiting homework-section spec from Paul/Neil before coding.

Bug B — Holiday filter missing:
  getWeekAttendance() does not query school_closures. Attendance sheets may include
  lesson rows on closed days (Good Friday, Christmas, etc.).
  Status: fix is known, awaiting sign-off.

Fix recipe (NOT YET RUN — awaiting spec):

Bug A: Add homework block to renderSheetHtml() in src/routes/attendance.ts.
  Spec needed: fields, layout, weekly vs. individual sheets.

Bug B: Add closure check to getWeekAttendance() query:
  AND session_date NOT IN (SELECT date FROM school_closures WHERE active = true)

Risk: display-only | Reversible: yes | Blast radius: attendance sheet rendering.
Status: OPEN — awaiting spec from Paul/Neil for Bug A. Bug B ready to fix on sign-off.
Last checked: 2026-08-22 Sat UTC (code check 47)
