Issue 36c -- Attendance: Students on Holiday Appear in Attendance Grid

Reporter: AC | Area: Attendance sheets | Sheet row: 43 (Issue 36)
New sub-issue added to G: 23/06/2026

SYMPTOM

Students on approved booking holiday still appear in the Attendance section with
live checkboxes and can be marked present or absent. The Classes section correctly
shows a holiday badge. This incorrectly affects attendance percentage.

ROOT CAUSE

Classes section fetches booking.holidays in src/scripts/classes.ts (lines 82-87).
Frontend (admin.html lines 7365-7387) computes onHoliday per assignment and renders
a holiday badge with disabled marking.

Attendance section (getWeekAttendance, src/scripts/attendance.ts lines 31-184) does
NOT fetch bookingHoliday records. The dailyData array (lines 144-160) has no
onHoliday field. loadWeeklyAttendance in admin.html (~line 8896) renders a live
checkbox for every student day with no holiday check.

Three surfaces NOT holiday-aware:
  - getWeekAttendance (attendance.ts:31) -- weekly admin grid
  - getClassAttendance (attendance.ts:187) -- single-day marking
  - renderSheetHtml / print routes (attendance.ts:36 / routes lines 189-244)

Note: studentSummary (attendance.ts:346-401) IS already holiday-aware via
fetchStudentHolidays + filterOutHolidayDates from attendance-pct.ts. Percentage
calculation is correct; bug is purely in the data-entry UI.

FIX RECIPE (NOT YET RUN)

Step 1: Backend getWeekAttendance (attendance.ts, after records query at line 112)

After line 112, add:
  const bookingIdSet = new Set();
  for (const sa of (classData.studentAssignments || [])) {
    const bkId = sa.bookingCourse && sa.bookingCourse.booking && sa.bookingCourse.booking.id;
    if (bkId) bookingIdSet.add(bkId);
  }
  const weekHolidayRows = bookingIdSet.size > 0
    ? await prisma.bookingHoliday.findMany({
        where: { bookingId: { in: [...bookingIdSet] }, startDate: { lte: friday }, endDate: { gte: monday } },
        select: { bookingId: true, startDate: true, endDate: true },
      })
    : [];
  const holsByBooking = new Map();
  for (const h of weekHolidayRows) {
    const s = new Date(h.startDate); s.setUTCHours(0,0,0,0);
    const e = new Date(h.endDate);   e.setUTCHours(0,0,0,0);
    if (!holsByBooking.has(h.bookingId)) holsByBooking.set(h.bookingId, []);
    holsByBooking.get(h.bookingId).push({ s: s.getTime(), e: e.getTime() });
  }

In students.map (line 140) before dailyData, resolve booking holidays:
  const bookingId = sa.bookingCourse && sa.bookingCourse.booking
    ? sa.bookingCourse.booking.id : null;
  const bookingHols = bookingId ? (holsByBooking.get(bookingId) || []) : [];

In dailyData days.map (line 144), add onHoliday per day:
  const dMs = d.getTime();
  const onHoliday = bookingHols.some(function(h) { return dMs >= h.s && dMs <= h.e; });
  // include onHoliday in the returned object alongside date/occurrenceId/cancelled etc.

Step 2: Backend getClassAttendance (attendance.ts, after records query ~line 249)

Add id: true to the booking select at line 221. Then after records query:
  const bkIds = (classData.studentAssignments || [])
    .map(function(sa) { return sa.bookingCourse && sa.bookingCourse.booking && sa.bookingCourse.booking.id; })
    .filter(Boolean);
  const dayHolRows = bkIds.length
    ? await prisma.bookingHoliday.findMany({
        where: { bookingId: { in: bkIds }, startDate: { lte: d }, endDate: { gte: d } },
        select: { bookingId: true }
      })
    : [];
  const dayHolBkIds = new Set(dayHolRows.map(function(h) { return h.bookingId; }));

Add to student return at line 258: onHoliday: bkId ? dayHolBkIds.has(bkId) : false

Step 3: Frontend admin.html loadWeeklyAttendance (~line 8964)

After cancelled branch, add holiday branch before existing checkbox block:
  } else if (day.onHoliday) {
    html += "<span ...>holiday</span>";
  } else {
    // existing checkbox + hours input (unchanged)
  }

Also guard markAllWeek to skip days where day.onHoliday is true.

Step 4: Printable sheet (attendance.ts routes lines 189-244)

Option A (recommended): in /print/week and /print/class, after getWeekAttendance,
filter out students whose ALL 5 days are onHoliday before passing to renderSheetHtml.
Students with partial-week holiday still appear.

Option B: extend renderSheetHtml to accept holidayDays boolean[] per student and
render HOL text in that day column.

Step 5: Rebuild and restart
  cd /home/sis/web/sis.ulearnschool.com/public_html/sis
  npm run build
  pm2 restart sis   # or systemctl restart sis

RISK / CATEGORY

- Category: Code -- UI data-entry bug
- Reversible: Yes -- code-only, no DB schema change
- Blast radius: Attendance grid for all classes; printable sheets. No booking/payment impact.
- Existing spurious rows: Any attendance records already created on holiday days remain.
  They are already excluded from percentage calc by studentSummary. Low-priority cleanup.

STATUS: NOT YET FIXED -- pending Neil approval.
Last checked: 2026-06-24 UTC
---
## Last checked: 8 Jul UTC (hrly11) — 10th code check
- getWeekAttendance (scripts/attendance.ts L31): NO bookingHoliday fetch CONFIRMED
- getStudentAttendance (L346+) correctly fetches holidays — only weekly-grid path missing
- Both attendance bugs still open (see also issue-36)
- Sheet row 37 H/I/J/K written

---
## 13th code check — 2026-07-08 UTC (hrly13)
CONFIRMED UNCHANGED. getWeekAttendance (scripts/attendance.ts L31): NO bookingHoliday fetch confirmed. getStudentAttendance (L346+) still correctly fetches holidays. Sheet row 37 J updated.

---
## 14th code check — 2026-07-09 UTC (hrly14)
CONFIRMED UNCHANGED. getWeekAttendance in src/scripts/attendance.ts lines 31-183 verified — no bookingHoliday fetch present. Students on holiday still appear with live checkboxes in the weekly attendance sheet. Sheet row 37 updated.

**16th code check 9 Jul UTC (hrly16): Hash changed (staff edited G column). Code re-confirmed unchanged: getWeekAttendance() in src/scripts/attendance.ts (lines 31-183) still does NOT fetch bookingHoliday records. Students on holiday appear with live attendance checkboxes in the weekly grid. Fix NOT RUN. Last checked: 2026-07-09 UTC (16th code check).**
---
## 17th code check — 2026-07-09 UTC (hrly18)
CONFIRMED UNCHANGED. Hash changed again (staff edited G description). Code re-verified:
- getWeekAttendance (src/scripts/attendance.ts lines 31-184): NO bookingHoliday fetch confirmed (full function read end-to-end).
- getStudentAttendance (lines 346+): DOES fetch holidays via fetchStudentHolidays — only weekly-grid path missing.
- renderSheetHtml (src/routes/attendance.ts line 36): no homework section (see issue-36).
Both bugs still open. Fix NOT RUN. Sheet row 37 H/J updated with 17th check stamp.

---
## 20th code check — 2026-07-09 UTC
CONFIRMED UNCHANGED. getWeekAttendance (src/scripts/attendance.ts lines 31-184): NO bookingHoliday fetch. Students on holiday appear in weekly grid with live checkboxes. fetchStudentHolidays called only in getStudentAttendance (line 364) — weekly-grid path missing. False-positive sha collision (two rows share issue#36). Both bugs still open. Fix NOT RUN. Sheet row 37 H/I/J/K written.

---
## 24th code check - 2026-07-10 UTC
CONFIRMED UNCHANGED. getWeekAttendance (src/scripts/attendance.ts lines 31-184): NO bookingHoliday fetch confirmed end-to-end. fetchStudentHolidays called only in getStudentAttendance (line 364) - weekly-grid path still missing. G column hash changed (minor staff edit to description). Both bugs still open. Fix NOT RUN. Sheet row 37 H/I/J/K written.

---
## 17th code check — 2026-07-24 Fri UTC
CONFIRMED UNCHANGED. getWeekAttendance (src/scripts/attendance.ts lines 31-184): NO bookingHoliday fetch. fetchStudentHolidays called only in getStudentAttendance (line 364) — weekly-grid and print-sheet paths still unpatched. Hash 45d13b7b false-positive trigger (G-column edit, since Jul 16). Commit 9008d10 STILL HEAD — no attendance file commits since Jul 17 2026. Fix NOT RUN. Last checked: 2026-07-24 Fri UTC.
