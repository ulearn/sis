## Issue 36 -- Attendance Sheets: Missing Homework Section + Holiday Filter (code check 28, Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Attendance Sheets | Sheet row: 37

## Symptom
Printed attendance sheets lack a homework section. Students on holiday appear on sheet with active IN/OUT cells.

## Root Cause (verified 2026-08-04 UTC, code check 28 -- UNCHANGED)

Bug A -- Homework block absent from printed sheet:
  renderSheetHtml() in src/routes/attendance.ts:36-182 has no homework section.
  Status: awaiting spec from Neil and Paul.

Bug B -- Holiday filter absent from getWeekAttendance():
  getWeekAttendance() in src/scripts/attendance.ts:31-184 filters by course end date only.
  No BookingHoliday filter -- students on holiday appear on sheet with live IN/OUT cells.
  studentSummary() (line 350+) IS holiday-aware; getWeekAttendance() is not.
  Status: ready to fix -- no spec needed.

Last attendance commit: 9008d10 (2026-05-08) -- 88 days ago. CompressUploads middleware only; homework and holiday logic untouched.

## Fix Recipe (NOT YET RUN)

Bug B -- Holiday filter in getWeekAttendance() (src/scripts/attendance.ts, after building students array ~line 140):

  const studentIds = students.filter(Boolean).map(s => s.studentId);
  const holidays = studentIds.length ? await prisma.bookingHoliday.findMany({
    where: {
      booking: { student: { id: { in: studentIds } } },
      startDate: { lte: friday },
      endDate: { gte: monday },
    },
    select: { booking: { select: { studentId: true } } },
  }) : [];
  const onHolidayIds = new Set(holidays.map(h => h.booking.studentId));
  // Then filter: const filteredStudents = students.filter(s => s && !onHolidayIds.has(s.studentId));
  // Return filteredStudents instead of students in the return object.

Bug A -- Homework section:
  Once Neil+Paul confirm format, add homework table inside sheetFor() in renderSheetHtml().

## Risk / Category
code | Reversible: yes (git revert) | All attendance sheets

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (code check 28)
Bug A awaiting spec. Bug B ready to implement.