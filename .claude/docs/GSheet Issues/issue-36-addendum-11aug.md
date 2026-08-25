# Issue 36 Addendum 11 Aug 2026 (code check 36)

Tue 11 Aug 2026 UTC. No code changes since check 35 (Mon 10 Aug).

## Bug A (unchanged) -- Homework block absent
renderSheetHtml() in src/routes/attendance.ts (lines 36-128) has no homework section. No spec provided yet.

## Bug B (unchanged) -- Holiday filter absent from sheet generation
getWeekAttendance() in src/scripts/attendance.ts (line 31) creates occurrences for all 5 weekdays (lines 103-106) without checking school closures. filterOutHolidayDates() exists (line 351+) but only in percentage-calc context.

## Fix Recipe (NOT YET RUN)

Bug B (implementable now):
In src/scripts/attendance.ts after building days[] array (lines 40-44), add:
  const closures = await prisma.schoolClosure.findMany({where:{date:{gte:monday,lte:friday}},select:{date:true}});
  const closedDates = new Set(closures.map(c => c.date.toISOString().split("T")[0]));
  const teachingDays = days.filter(d => !closedDates.has(d.toISOString().split("T")[0]));
Then use teachingDays instead of days for occurrence creation.

Bug A: awaiting spec from Neil/Paul (rows, fields, layout).

## Risk: code change, reversible, all attendance sheets affected (cosmetic)

**Last checked:** Tue 11 Aug 2026 UTC (code check 36)
