# Issue 15 — Saikhantes Shagdarsuren — Addendum 13 Aug 2026 (c)

Sheet row 16 | Check 110th | 249th global run ~18:xx UTC

No change since 109th check (17:03 UTC today).

- Booking 18151: CONFIRMED, confirmed=true, amountPaid=EUR 1,339.20, amountOpen=EUR 0, serviceEnd=2026-08-07 (expired 6 days ago), updatedAt=2026-07-08
- BC 24925 (Academic Year Afternoon): endDate=2026-10-02, active=true, 1 class assignment
- SCA 255: classId=11 (B1 PM), bookingCourseId=24925, weekEnd=2026-07-03 — 41 days stale
- Correct serviceEnd = 2026-10-02 (matches BC 24925)

Fix (NOT YET RUN):
  UPDATE StudentClassAssignment SET week_end='2026-10-02' WHERE id=255;
  UPDATE Booking SET service_end='2026-10-02' WHERE id=18151;

Status: Open. service_end expired 6d (Aug 7). SCA 255 expired 41d (Jul 3). Fix NOT RUN.
Last checked: 2026-08-13 ~18:xx UTC
