Issue 36 - Attendance Sheet: Homework + Holiday Filter (code check 32, Fri 7 Aug 2026)
Reporter: Staff | Area: Attendance sheets | Sheet row: 37

Symptom
Attendance sheets do not include a homework section. Students on holiday also appear on sheets.

Root cause (code check 32 - unchanged from check 31)

Bug A - Homework block:
- Absent from renderSheetHtml() in src/routes/attendance.ts (lines 36-178)
- Spec not yet provided - cannot implement without format confirmation

Bug B - Holiday filter on attendance sheet:
- Holiday-aware logic (fetchStudentHolidays, filterOutHolidayDates) exists in src/scripts/attendance.ts (lines 346-401) for percentage calc only
- renderSheetHtml() in src/routes/attendance.ts does NOT apply holiday filter to sheet rows
- Students on holiday appear on printed sheets with blank cells, confusing teachers

Fix recipe (NOT YET RUN)

Bug B (no spec needed - can proceed):
  1. Import fetchStudentHolidays in src/routes/attendance.ts route handler (line ~193)
  2. Fetch: const holidays = await fetchStudentHolidays(prisma, booking.studentId)
  3. Pass holidays into renderSheetHtml() as new parameter
  4. In renderSheetHtml(), mark rows where occurrence.date falls in holiday range as HOLIDAY (grey, kept on sheet)

Bug A (awaiting spec):
  Once Neil/Paul confirm homework format, add HTML block below attendance grid.

Risk: code; non-financial; reversible; affects printed attendance sheets only.
Status: Bug A open awaiting spec. Bug B open can proceed. Last checked: Fri 7 Aug 2026 UTC (code check 32)