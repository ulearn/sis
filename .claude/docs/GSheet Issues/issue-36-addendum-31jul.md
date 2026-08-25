# Issue 36 — Attendance: Missing Homework + Holiday Filter (Addendum 31 Jul 2026, check #24)
Sheet row: 37 | Reporter: staff | Area: Attendance sheets

UNCHANGED (24th code check Fri 31 Jul UTC).
Last commit to src/routes/attendance.ts: 9008d10 (May 8 2026) — only added compressUploads() on upload routes.
renderSheetHtml() and getWeekAttendance() not touched. 84 days since last logic change.

Bug A: No homework block in renderSheetHtml() — awaiting spec from Neil+Paul.
Bug B: No BookingHoliday filter in getWeekAttendance() — holiday students show live checkboxes.

Fix recipe (NOT YET RUN):
Bug B (no spec needed): in getWeekAttendance(), query BookingHoliday where startDate<=weekEnd AND endDate>=weekStart AND studentId IN students; exclude those studentIds from attendance grid.
Bug A: spec needed first (fields, position, per-student or per-class).

Risk: Code only — no data changes. Reversible. Blast: all future attendance sheets.
Status: OPEN — Bug B ready to fix; Bug A awaiting spec. Last checked: Fri 31 Jul 2026 UTC
