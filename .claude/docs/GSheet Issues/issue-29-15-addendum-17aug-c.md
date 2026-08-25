Issue 29 & 15 — Saikhantes Shagdarsuren — URGENT: Return SCA Missing (343rd run)
Row: 30 | Run: 343rd Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB — 113th check)
- Student 1001, Booking 18151: CONFIRMED, EUR 1,339.20 fully paid, amountOpen = 0
- BC 24925 (Academic Year Afternoon): active, start 9 Mar 2026, end 2 Oct 2026
- SCA 255: class 11, weekEnd 2026-07-03 — expired 45 days (UNCHANGED)
- Holiday ends Fri 21 Aug (4 days); return to class Mon 24 Aug (7 days)
- NO new SCA created — return SCA still missing
- Duplicate of Issue 15 (row 16)

URGENT: Return to class Mon 24 Aug 2026. Act before Monday morning.

FIX (NOT YET RUN — same as Issue 15):
  await p.studentClassAssignment.create({data:{
    studentId:1001, classId:11, bookingCourseId:24925,
    weekStart:new Date("2026-08-24T00:00:00.000Z"),
    weekEnd:new Date("2026-10-02T00:00:00.000Z"),
  }});

RISK: Reversible. 1 student, 1 insert.
See full recipe: issue-29-15-addendum-17aug-b.md
Last checked: 2026-08-17 UTC (343rd hourly run, 113th check for this issue)
