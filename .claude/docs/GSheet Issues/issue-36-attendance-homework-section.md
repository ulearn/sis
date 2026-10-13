Issue 36 (row 37) -- Attendance Sheet Homework Section Missing

Reporter: AC | Area: Attendance Sheets | Sheet row: 37

Symptom
Attendance sheets generated from SIS do not include a homework section.
Students on holiday also appear with live checkboxes.

Root Cause (1506th check, Fri 9 Oct 2026)
- renderSheetHtml() in src/routes/attendance.ts: no homework block implemented
- grep for homework in attendance.ts returns no matches -- confirmed absent
- File is modified in current git diff but homework has not been added
- Holiday filtering: getWeekAttendance() in src/scripts/attendance.ts does not filter
  students whose holiday covers the queried week

Fix Recipe (NOT YET RUN)

Step 1 -- Homework section in renderSheetHtml():
  Awaiting layout spec from Neil and Paul before implementing.

Step 2 -- Holiday filter in getWeekAttendance():
  Fetch BookingHoliday records overlapping the queried week.
  Mark or exclude students where holiday overlaps [monday, friday].
  Render as grey row or HOL label in the sheet.

Risk: Code | Low blast radius (attendance route + script only) | Reversible

Status: Open. Neither fix run. Awaiting homework spec from Neil/Paul.
Last checked: 2026-10-09 UTC (1506th run).