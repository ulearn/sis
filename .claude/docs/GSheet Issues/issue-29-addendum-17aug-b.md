# Issue 29 & 15 — Saikhantes Shagdarsuren (107th check, 17 Aug 2026 UTC)
Reporter: | Area: Booking/Class | Sheet row: 30

This issue shares live data and fix recipe with Issue 15 (row 16). See issue-15-addendum-17aug-b.md.

## Summary
- Booking 18151: CONFIRMED, EUR 1,339.20 fully paid, serviceEnd EXPIRED (2026-08-07, 10d ago)
- BC 24925 (Academic Year Afternoon): Mar 9 to Oct 2 2026, active = true
- SCA 255: class 11, weekEnd 2026-07-03 — EXPIRED 45 days ago
- Student returns Fri 21 Aug 2026 = 4 DAYS FROM NOW — no active class assignment on return
- Original issue (BC start Jan 12 vs Mar 9): confirmed as Fidelo restart date artefact — not a data bug

## Fix recipe (NOT YET RUN) — see issue-15-addendum-17aug-b.md
  UPDATE Booking SET serviceEnd = '2026-10-02', updatedAt = NOW() WHERE id = 18151;
  INSERT INTO StudentClassAssignment (bookingCourseId,classId,weekStart,weekEnd,studentId,createdAt,updatedAt)
    VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001, NOW(), NOW());

## Status
OPEN — fix NOT RUN. Returns in 4 days. Shares recipe with Issue 15.
Last checked: 2026-08-17 UTC (107th check)