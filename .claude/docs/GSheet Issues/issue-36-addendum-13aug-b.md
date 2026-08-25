Issue 36 -- Attendance Code: Homework Block + Holiday Filter

Reporter: AC | Area: Attendance Sheets | Sheet row: 37
Code check 38 -- Thu 13 Aug 2026 UTC

Symptom:
A) Attendance sheets missing homework section. B) Holiday students still appear on sheets.

Root Cause:
Bug A: renderSheetHtml() in src/routes/attendance.ts (lines 36-128) -- no homework block. Awaiting spec from Paul/Neil.
Bug B: getWeekAttendance() in src/scripts/attendance.ts (lines 102-106) -- creates 5 occurrences Mon-Fri without checking school_closures.
No attendance.ts changes since Wed 12 Aug (check 37). Both bugs unchanged.

Fix Recipe (NOT YET RUN):
Bug B: Filter out school_closure dates when building occurrences in getWeekAttendance().
Bug A: Implement after spec from Paul/Neil.

Risk: code | Reversible: yes | Blast radius: attendance sheet display only

Status: OPEN | Last checked: Thu 13 Aug 2026 UTC (code check 38)
Previous recipe: issue-36-addendum-13aug.md