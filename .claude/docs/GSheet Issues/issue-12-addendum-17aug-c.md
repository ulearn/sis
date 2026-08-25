Issue 12 - Rakan Alghamdi - SCA on Wrong BC (341st run)
Row: 13  Run: 341st Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB)
- Student 14444, Booking 17915: CONFIRMED, fully paid
- SCA 288: classId=12, weekEnd=2026-12-18 -- on BC 24697 (WRONG, ended Jul 31, 17d stale)
- BC 25035 (General English AY AM Plus): 2026-08-03 to 2026-12-18, active=true, 0 SCAs (14d)

FIX (NOT YET RUN):
  await p.studentClassAssignment.update({where:{id:288},data:{bookingCourseId:25035}});
  await p.bookingCourse.update({where:{id:24697},data:{active:false}});
  // Verify: SCA288 bookingCourseId=25035; BC24697 active=false

RISK: reversible. 1 student, 2 records.
See also: issue-12-addendum-17aug-b.md (full recipe from 05:14 UTC today)
Last checked: 2026-08-17 (341st hourly run)