# Issue 36 — Attendance: Missing Homework + Holiday Filter (Addendum 2 Aug 2026, check #25)
Sheet row: 37 | Reporter: staff | Area: Attendance sheets

UNCHANGED (25th code check Sun 2 Aug 2026 UTC).
Last commit to attendance.ts files: 9008d10 (May 8 2026) — compressUploads() on upload routes only.
Homework and holiday logic untouched. 86 days since last attendance logic change.

Bug A — homework block: renderSheetHtml() (src/routes/attendance.ts lines 36-129) has no homework section.
Ends </section> after student grid. Awaiting spec from Neil+Paul (fields, position, per-student or per-class).

Bug B — holiday filter: getWeekAttendance() (src/scripts/attendance.ts lines 31-184) has no BookingHoliday
query. Holiday students appear with live checkboxes. studentSummary() IS holiday-aware (uses fetchStudentHolidays
from attendance-pct.ts) but this logic is not shared with getWeekAttendance(). Bug B ready to fix now.

Fix recipe (NOT YET RUN):
Bug B: In getWeekAttendance(), after fetching classData, add:
  const holidayRows = await prisma.bookingHoliday.findMany({
    where: { startDate: { lte: friday }, endDate: { gte: monday },
             studentId: { in: studentIdsInWeek } },
    select: { studentId: true, startDate: true, endDate: true }
  });
Mark each daily slot as onHoliday=true when day falls within a student holiday range.
Update renderSheetHtml() to render holiday days with a badge / greyed cell.

Bug A: Once spec confirmed, add homework section inside sheetFor() after </table>, before </section>.

Risk: Code only — no data changes. Reversible. Blast: all future attendance sheets.
Status: OPEN — Bug B ready to fix; Bug A awaiting spec. Last checked: Sun 2 Aug 2026 UTC
