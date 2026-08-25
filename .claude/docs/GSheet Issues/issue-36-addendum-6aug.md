# Issue 36 — Attendance Sheets: Missing Homework Section + Holiday Filter (code check 30, Thu 6 Aug 2026 UTC)

Reporter: AC | Area: Attendance Sheets | Sheet row: 37

## Symptom
Printed attendance sheets lack a homework section. Students on holiday appear on sheet with live IN/OUT cells.

## Root Cause (verified Thu 6 Aug 2026 UTC, code check 30)

Hash change trigger: B/F/G cell edited in issue row (staff likely cleared B column). Both bugs re-confirmed unchanged.
Last attendance commit: 9008d10 (2026-05-08) — 90 days ago. compressUploads middleware only; homework/holiday logic untouched.

Bug A — Homework block absent from printed sheet:
renderSheetHtml() in src/routes/attendance.ts lines 36-178: header, meta table, IN/OUT grid, headcount row. No homework section.
sheetFor() inner function (lines 59-128) ends after headcount row. Status: awaiting spec from Neil + Paul.

Bug B — BookingHoliday filter absent from getWeekAttendance():
getWeekAttendance() in src/scripts/attendance.ts lines 31-184 filters students by course dates only.
No bookingHoliday fetch anywhere. Students on approved holiday appear on sheet with live IN/OUT cells.
studentSummary() at line 346+ calls fetchStudentHolidays() + filterOutHolidayDates() — pct calc correct. Bug is data-entry only.

Three surfaces NOT holiday-aware:
  - getWeekAttendance (attendance.ts line 31) — weekly admin grid + printed sheet
  - getClassAttendance (attendance.ts line 187) — single-day marking
  - renderSheetHtml / print routes (attendance.ts lines 36/189-244) — printed sheet

## Fix Recipe (NOT YET RUN)

Full step-by-step in issue-36c-attendance-holiday-display.md. Summary:

Bug B (ready, no spec needed):
After records query at line 112, add bookingHoliday.findMany scoped to booking IDs in week + date range.
Resolve onHoliday: boolean per student per day. Render HOL cell instead of checkbox.
Guard markAllWeek to skip holiday days.

Bug A (awaiting spec):
Once Neil+Paul confirm format, add homework table inside sheetFor() in renderSheetHtml() before closing </section>.

## Risk / Category
code | Reversible: yes (git revert) | Blast radius: all attendance sheets + weekly admin grid
No DB schema change. No booking/payment impact.

## Status
NOT YET RUN | Last checked: Thu 6 Aug 2026 UTC (code check 30)
Bug A awaiting spec. Bug B ready to implement.
