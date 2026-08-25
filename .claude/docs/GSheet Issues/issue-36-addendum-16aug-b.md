# Issue 36 - Attendance Homework / Holiday Filter (Code check 41)
Reporter: Staff | Area: Code | Sheet row: 37 | Sun 16 Aug 2026 UTC

Symptom: Attendance sheets missing homework section; holiday dates not filtered.

Root Cause (Code check 41 - 16 Aug 2026 UTC):
- Bug A (Homework): renderSheetHtml() in src/routes/attendance.ts (lines 36-128) - no homework block; awaiting spec from Paul/Neil
- Bug B (Holiday filter): getWeekAttendance() in src/scripts/attendance.ts (lines 102-106) creates occurrences for all 5 weekdays without checking school_closures; filterOutHolidayDates() applied after-the-fact only
- Both files unchanged since 2026-06-22 (git log confirmed)
- No change from Code check 40 (Sat 15 Aug).

Fix Recipe (NOT YET RUN):
Bug B (no spec needed): In src/scripts/attendance.ts lines 102-106, add check against school_closures before pushing each weekday occurrence; skip dates with a closure record.
Bug A (awaiting spec): Once Neil/Paul specify homework section fields/format, add block to renderSheetHtml() in src/routes/attendance.ts.

Risk: Code | Safe | Low blast radius - attendance rendering only
Status: Open - awaiting spec for Bug A; Bug B ready to implement | Last checked: Sun 16 Aug 2026 UTC
