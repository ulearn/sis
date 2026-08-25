Issue 36 attendance homework section — code check 21 (29 Jul 2026)
Reporter: AC | Area: Attendance sheets | Sheet row: 37

Symptom A: Attendance sheets do not include a homework section.
Symptom B: Students on holiday still appear on attendance sheets with live checkboxes.

Root cause:
Symptom A: renderSheetHtml() in src/routes/attendance.ts (lines 36-128) has no homework block.
  Awaiting layout spec from Neil and Paul.
Symptom B: getWeekAttendance() in src/scripts/attendance.ts (lines 31-88) does not filter out
  students whose holiday date range covers the week being viewed.
  The SCA filter at lines 62-65 only checks weekEnd/bookingCourse.endDate — no holiday lookup.
  10 students are currently on holiday today (29 Jul 2026) and would appear on sheets:
  studentIds: 400, 744, 803, 814, 945, 1001, 1028, 856, 14522, 917
Last commit: 9008d10 (17 Jul 2026) — no attendance commits since then.

Fix recipe (NOT YET RUN):
Symptom B — add holiday filter to getWeekAttendance() in src/scripts/attendance.ts:
  After fetching studentAssignments, fetch BookingHoliday records covering the week.
  Filter out (or flag) student assignments where a holiday covers the queried week.
  Example approach: fetch active holidays overlapping [monday, friday] for relevant bookings,
  then mark students on_holiday=true in the response (already returned for the student portal view).
Symptom A — add homework block to renderSheetHtml() in src/routes/attendance.ts:
  Wait for Neil and Paul to confirm layout spec before implementing.

Risk: Code fix. src/scripts/attendance.ts only. Low blast radius.
  Reversible — holiday filter is additive; does not affect existing attendance records.

Status: Both bugs open. Fix NOT RUN. Awaiting spec for homework section.
Last checked: 2026-07-29 UTC (code check 21)