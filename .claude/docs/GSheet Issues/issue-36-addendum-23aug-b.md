# Issue 36 (a) Addendum 23 Aug 2026 — Attendance Sheets Homework Section

Reporter: (staff) | Area: Attendance sheets | Sheet row: 37

Root cause (code check 48, Sun 23 Aug 2026 UTC — no changes since check 47 Sat 22 Aug):

Bug A — Homework block absent:
  renderSheetHtml() in src/routes/attendance.ts (lines 36–120) generates the HTML
  attendance sheet but contains no homework section. Paul confirmed it should be included.
  Status: awaiting homework-section spec from Paul/Neil before coding.

Bug B — Holiday filter missing:
  getWeekAttendance() in src/scripts/attendance.ts (lines 31–90) does not query
  school_closures. Attendance sheets may include lesson rows on closed days (Good Friday,
  Christmas, etc.). The 5 weekdays are built unconditionally in lines 39–44.
  Status: fix is known, awaiting sign-off.

Fix recipe (NOT YET RUN — awaiting spec):

Bug A: Add homework block to renderSheetHtml() in src/routes/attendance.ts after the
  attendance grid. Spec needed from Paul/Neil: fields (set/type/mark?), layout
  (per-student rows vs. single block), weekly vs. individual sheets.

Bug B: Add closure check to getWeekAttendance(). Pattern:
  const closures = await prisma.schoolClosure.findMany({
    where: { date: { gte: monday, lte: friday }, active: true }
  });
  const closureDates = new Set(closures.map(c => c.date.toISOString().slice(0,10)));
  Then filter days array: days.filter(d => !closureDates.has(d.toISOString().slice(0,10)))
  This prevents rendering In/Out columns for closed days.

Risk: display-only | Reversible: yes | Blast radius: attendance sheet rendering.
Status: OPEN — awaiting spec from Paul/Neil for Bug A. Bug B ready to fix on sign-off.
Last checked: 2026-08-23 Sun UTC (code check 48)
