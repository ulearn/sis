# Issue 36 — Attendance Sheets: Homework Block + Holiday Filter (46th check Fri 21 Aug 2026)

**Reporter:** ST/Paul | **Area:** Attendance | **Sheet row:** 37

## Root Cause (codebase, Fri 21 Aug 2026)

- Bug A — Homework block: keyword homework not found in src/routes/attendance.ts;
  renderSheetHtml() (line 36) generates no homework section. Awaiting spec from Paul/Neil.
- Bug B — Holiday filter: getWeekAttendance() creates occurrences for all 5 weekdays;
  filterOutHolidayDates() applied post-generation; closures not pre-checked.

## Fix Recipe (NOT YET RUN — awaiting spec)

Bug A: Add homework block after attendance grid in renderSheetHtml() once Paul confirms format.

Bug B: In getWeekAttendance(), query schoolClosure before generating occurrences and skip closure dates.

## Risk
- Category: code | Reversible via git | Medium blast radius (all attendance sheets)

## Status
Both bugs unchanged. Fix NOT RUN. Awaiting spec from Paul/Neil.
**Last checked:** 2026-08-21 UTC (46th check)