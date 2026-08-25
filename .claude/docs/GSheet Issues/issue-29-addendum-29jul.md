Issue 29 addendum 29 Jul 2026 (duplicate of Issue 15)
Saikhantes Shagdarsuren (booking 18151, student 1001)
Sheet row 30

Symptom: Course dates wrong — where did 12/01/2026 come from?

Root cause (duplicate of Issue 15):
BC 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active=true
SCA 255: class 11, weekStart=12 Jan 2026, weekEnd=3 Jul 2026 (expired 26 days ago)
Holiday 2500: 20 Jul to 21 Aug 2026 (5 weeks, 25 weekdays pushed)
Student returns: Monday 24 Aug 2026
BC 24925 remaining window: Mon 24 Aug to Fri 2 Oct 2026
Student 1001 last updated: 28 Jul 2026 09:38 UTC (bulk touch)

Fix recipe (NOT YET RUN):
See Issue 15 (issue-15-addendum-29jul.md). Add new SCA for student 1001 on BC 24925, class 11.
Via SIS Admin: Student 1001 → Booking → BC 24925 → Class Assignments → Add SCA
  Class: 11 (Academic Year Afternoon)
  Week Start: 2026-08-24
  Week End: 2026-10-02

Risk: Bookings / class assignment. Reversible. Action deadline: before Mon 24 Aug 2026.

Status: Unchanged from 28 Jul 2026. Fix NOT RUN.
Last checked: 2026-07-29 UTC