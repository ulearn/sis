Issue 36 -- Attendance Sheets Homework Section (Addendum Wed 29 Jul 2026 -- code check 22)

Reporter: AC | Area: Attendance sheets | Sheet row: 37

STATUS: Both bugs still open. Code unchanged since May 8 2026 (commit 9008d10).
Hash change on this row detected (G cell minor formatting edit); content unchanged.

EVIDENCE:

Latest commit touching attendance.ts: 9008d10 (May 8 2026)
Change in 9008d10: added compressUploads() middleware to upload routes only
  Not related to homework section or holiday display bugs.

Bug 1 -- Homework section missing:
  renderSheetHtml() in src/routes/attendance.ts (lines ~36-128)
  No homework block present. Awaiting spec/layout from Neil and Paul.

Bug 2 -- Holiday display:
  getWeekAttendance() in src/scripts/attendance.ts does not filter students on holiday.
  Students on holiday still appear on sheets with live checkboxes.

FIX RECIPE (NOT YET RUN):

Bug 1: Neil/Paul to supply homework section layout spec.
  Then add homework block to renderSheetHtml() in src/routes/attendance.ts.

Bug 2: In getWeekAttendance() (src/scripts/attendance.ts lines 31-88):
  Filter out students whose booking.holidays overlap the requested week.
  See base recipe: issue-36-attendance-homework-section.md for full detail.

RISK: code - low risk - view-only rendering change

Status: OPEN - awaiting spec for bug 1; bug 2 ready to implement
Last checked: Wed 29 Jul 2026 UTC