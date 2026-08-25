Issue 36 - Attendance Sheet Missing Homework Section
Reporter: (staff) | Area: Attendance sheets | Sheet row: 37
Last checked: 10 Aug 2026 UTC (code check 35)

SYMPTOM
Attendance sheets generated from SIS do not include the homework section. Paul confirmed it should be present.

ROOT CAUSE (code check 35 - 10 Aug 2026 UTC)
Two distinct bugs - both still present. Source files last modified 2026-06-22 (no changes).

Bug A - Homework block absent from rendered sheet:
  File: src/routes/attendance.ts
  renderSheetHtml() spans lines 36-182 and contains no homework block rendering.
  Awaiting spec from Paul/Neil: fields, format, and position within the sheet.

Bug B - Holiday filter absent from sheet attendance query:
  File: src/scripts/attendance.ts
  getWeekAttendance() does not filter out holiday dates.
  filterOutHolidayDates() exists in attendance-pct.ts but is NOT imported into the sheet render path.
  This bug is implementable NOW without a spec - the function already exists.

FIX RECIPE - NOT YET RUN

Fix B (no spec needed - implement first):
  In src/scripts/attendance.ts -> import filterOutHolidayDates from attendance-pct.ts
  Apply inside getWeekAttendance() before returning the session list.
  Rebuild + restart (touch tmp/restart.txt)

Fix A (spec required):
  Neil/Paul: confirm where homework block appears in sheet and what fields it needs.
  Once spec provided: add homework block rendering inside renderSheetHtml() in src/routes/attendance.ts

RISK: Code change (Bug B: low risk, uses existing function). Code change (Bug A: needs spec). Both reversible.

STATUS: Open - Bug A awaiting spec; Bug B implementable now.
Last checked: 10 Aug 2026 UTC (code check 35, no changes since check 34)