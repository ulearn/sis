Issue 15 - Saikhantes Shagdarsuren - URGENT: Return SCA Missing (341st run)
Row: 16  Run: 341st Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB)
- Student 1001, Booking 18151: CONFIRMED, EUR 1339.20 fully paid, amountOpen=0
- BC 24925 (AY Afternoon): 2026-03-09 to 2026-10-02, active=true
- SCA 255: class 11, weekEnd 2026-07-03 -- expired 45 days ago (unchanged)
- Holiday 2500: 2026-07-20 to 2026-08-21 (Fri) -- return Mon 2026-08-24 (7 days)
- NO return SCA -- student cannot be tracked or attend from Mon

URGENT: Return Mon 24 Aug 2026. Act before Mon morning.

FIX (NOT YET RUN):
  await p.studentClassAssignment.create({data:{
    studentId:1001, classId:11, bookingCourseId:24925,
    weekStart:new Date("2026-08-24T00:00:00.000Z"),
    weekEnd:new Date("2026-10-02T00:00:00.000Z"),
  }});

RISK: reversible. 1 student, 1 insert.
See also: issue-15-addendum-17aug-e.md (full recipe from 12:13 UTC today)
Last checked: 2026-08-17 (341st hourly run)