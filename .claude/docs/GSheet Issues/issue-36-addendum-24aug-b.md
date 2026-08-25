Issue 36 - Attendance Sheet: Homework Section Missing (Addendum 24 Aug 2026-b)

Reporter: AC | Area: Attendance sheets | Sheet row: 37 | Run: 498th (Mon 24 Aug 2026 UTC)

Symptom
Attendance sheets from SIS have no homework section. Paul confirmed it should be included.
G column edited again since 497th run. Code diagnosis unchanged.

Root Cause - Current State

File: src/routes/attendance.ts

Bug A - No homework block in renderSheetHtml() lines 36-130:
  Renders: logo/header, N.B. note, sheet title, meta table (week/group/teacher/cover),
  attendance grid (IN/OUT per day Mon-Fri), head count row.
  Nothing after closing table tag at line 127. Missing feature, not regression.

Bug B - No school_closures check in getWeekAttendance():
  Sheets may show lesson columns on bank holidays and Christmas.
  Needs query against school_closures for weekStart..weekEnd range.

Both bugs need spec before implementation.

Fix Recipe (NOT YET RUN - awaiting spec from Paul/Neil)

Step 1 - Agree spec:
  - Homework layout: rows per day? single box? separate page?
  - Placement: below grid on same page, or separate section per class?
  - Closure columns: omit entirely, or show greyed/labelled CLOSED?

Step 2 - Add homework block after .grid table around line 127 in attendance.ts:
  Structure TBD per spec - e.g. one row per school day with notes box.

Step 3 - Add closure filter to getWeekAttendance():
  Query school_closures for weekStart..weekEnd; filter or mark closure days.

Step 4 - After changes: npm run build + touch tmp/restart.txt

Risk / Category
code / documents | reversible | affects all printed attendance sheets going forward

Status
Open - awaiting spec. Last checked: 24 Aug 2026 UTC (498th run).