# Issue 36 Addendum — code check 34 — Sun 9 Aug 2026 UTC

Reporter: AC | Area: Attendance sheets | Row 37

Bug A -- Homework block absent:
- renderSheetHtml() in src/routes/attendance.ts lines 36-182 has no homework section
- Renders: logo/NB, title, meta table, attendance grid, headcount -- nothing else
- BLOCKED: awaiting spec from Paul/Neil (exact format/layout needed)

Bug B -- Holiday filter absent:
- getWeekAttendance() in src/scripts/attendance.ts does not filter holiday students
- All students with active class assignments appear in sheet regardless of holiday
- filterOutHolidayDates() exists in attendance-pct.ts but is not used here
- CAN BE FIXED NOW (no spec needed)

BUG B FIX RECIPE (NOT YET RUN):
In src/scripts/attendance.ts getWeekAttendance(), after building the students array,
add a holiday query:

  const studentIds = students.filter(Boolean).map(s => s.id);
  const holidaysThisWeek = studentIds.length
    ? await prisma.bookingHoliday.findMany({
        where: {
          booking: { studentId: { in: studentIds } },
          startDate: { lte: friday },
          endDate: { gte: monday },
        },
        select: { booking: { select: { studentId: true } } },
      })
    : [];
  const onHoliday = new Set(holidaysThisWeek.map(h => h.booking.studentId));
  const filteredStudents = students.filter(s => s && !onHoliday.has(s.id));

Return filteredStudents instead of students in the sheet response.

BUG A FIX RECIPE: Blocked until spec received from Paul/Neil.

Risk: Bug B low/reversible, improves accuracy. Bug A blocked.
Status: Open, both bugs unfixed. Code check 34. Bug B ready; Bug A awaiting spec.
Last checked: Sun 9 Aug 2026 UTC