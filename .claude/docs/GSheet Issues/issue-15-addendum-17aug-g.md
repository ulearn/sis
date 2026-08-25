Issue 15 — Saikhantes Shagdarsuren — URGENT: Return SCA Missing (343rd run)
Row: 16 | Run: 343rd Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB — 149th check)
- Student 1001, Booking 18151: CONFIRMED, EUR 1,339.20 fully paid, amountOpen = 0
- BC 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active = true
- SCA 255: class 11, weekEnd 2026-07-03 — expired 45 days ago (UNCHANGED)
- Holiday 2500: 2026-07-20 to 2026-08-21 (Fri) — return to class Mon 2026-08-24 (7 days)
- NO return SCA — student cannot be tracked or attend from Mon 24 Aug

URGENT: Return Mon 24 Aug 2026. Act before Monday morning.

FIX (NOT YET RUN):
  await p.studentClassAssignment.create({data:{
    studentId:1001, classId:11, bookingCourseId:24925,
    weekStart:new Date("2026-08-24T00:00:00.000Z"),
    weekEnd:new Date("2026-10-02T00:00:00.000Z"),
  }});

RISK: Reversible. 1 student, 1 insert. Low blast radius.
See full recipe: issue-15-addendum-17aug-f.md
Last checked: 2026-08-17 UTC (343rd hourly run, 149th check for this issue)
