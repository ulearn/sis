Issue 36 addendum 4 Aug 2026 (code check 27)

Bug A - Homework block (awaiting spec):
renderSheetHtml() in src/routes/attendance.ts has no homework section. Paul confirmed it should be included. Spec not agreed. BLOCKED on Neil+Paul spec.

Bug B - Holiday filter in getWeekAttendance (ready to fix):
getWeekAttendance() in src/scripts/attendance.ts (lines 31-184) builds student rows from studentAssignments filters only. No BookingHoliday filter. Holiday students appear with live checkboxes. studentSummary() IS holiday-aware. Last code change: 9008d10 (compressUploads middleware, 88 days ago).

FIX NOT YET RUN (Bug B - no spec needed):
In getWeekAttendance() after building students:
1. Fetch BookingHoliday records overlapping [monday, friday] for the class student IDs.
2. Compute isOnHoliday per student per day.
3. Add isOnHoliday to dailyData return value.
4. In HTML output, render holiday cells greyed/disabled.

Fix Bug A: spec needed first.

Last checked: 2026-08-04 UTC