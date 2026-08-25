# Issue 36 — Attendance Sheets: Homework + Holiday Filter (code check 31, Thu 6 Aug 2026)

Reporter: AC | Area: Attendance sheets | Sheet row: 37

## Root cause (code check 31)
Two code bugs confirmed open. No commits to attendance files since 9008d10 (2026-05-08).

Bug A - Homework block: renderSheetHtml() in src/routes/attendance.ts (lines 36-178)
does not include a homework section. Awaiting spec from Paul/Neil.

Bug B - BookingHoliday filter: getWeekAttendance() in src/scripts/attendance.ts (lines 31-184)
does not exclude students on holiday. Students with active BookingHoliday overlapping the week
appear on the printed sheet with IN/OUT cells — they should be excluded.

## Fix recipe (NOT YET RUN)

Bug B (no spec needed):
In src/scripts/attendance.ts, inside getWeekAttendance(), add:
  const holidays = await prisma.bookingHoliday.findMany({
    where: { startDate: { lte: weekEndDate }, endDate: { gte: weekStartDate } },
    select: { bookingId: true }
  });
  const holidayIds = new Set(holidays.map(h => h.bookingId));
  // filter out students whose bookingId is in holidayIds

Bug A (awaiting spec):
Once homework format confirmed, add HTML block to renderSheetHtml() in src/routes/attendance.ts.

## Risk
Category: code / UX; reversible; affects all generated attendance sheets

## Status
Both bugs open. Bug B can proceed. Bug A waiting on spec.
Last checked: Thu 6 Aug 2026 UTC (code check 31)