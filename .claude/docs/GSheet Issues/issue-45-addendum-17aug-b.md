Issue 45 - Stale Active Booking Courses (341st run)
Row: 47  Run: 341st Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB)
- 24,497 Booking Courses: endDate < 2026-08-17, active=true -- unchanged from previous check
- Arrivals-list logic filters on active BCs; stale BCs suppress renewal-student entries
- Most recently ended: courses ending Aug 14

FIX (NOT YET RUN):
  // Dry run first:
  const count=await p.bookingCourse.count({where:{endDate:{lt:new Date()},active:true}});
  console.log("Stale:",count); // Expect 24497
  // Then after Neil confirms:
  await p.bookingCourse.updateMany({where:{endDate:{lt:new Date()},active:true},data:{active:false}});

RISK: reversible (updateMany no deletes). Large blast: 24,497 records. Batch by 1000 if needed.
STATUS: NOT RUN. Awaiting Neil sign-off.
See also: issue-45-addendum-17aug.md (from 02:12 UTC today)
Last checked: 2026-08-17 (341st hourly run)