Issue 29 Addendum 7 Aug 2026 (Holiday Return + Expired Booking)

Reporter: pg | Row: 30 | Last checked: Fri 7 Aug 2026 UTC (5th check)

ROOT CAUSE
- Booking 18151 service_end = 2026-08-07 EXPIRED TODAY (see Issue 15 row 16)
- BC 24925 (AY Afternoon, Mar 9 to Oct 2 2026): active, correct dates
- Last SCA 255: class 11 (B1 PM), week_end = 2026-07-03, 35 days expired
- Student on holiday until Mon 24 Aug 2026 (17 days)
- No SCA covers return week (24 Aug to 2 Oct)
- BC 1982 (AY Morning, Jun 30 to Dec 19 2025, bk 1724): different booking, still active, separate stale cleanup

FIX RECIPE (NOT YET RUN)

Step 1 - Fix service_end (see Issue 15 row 16)
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Step 2 - Create SCA for return from holiday (before 24 Aug)
  In SIS Admin, assign student 1001 to class 11 (B1 PM) for week starting 2026-08-24.

Step 3 - Deactivate old stale BC 1982 (booking 1724, not 18151)
  UPDATE booking_courses SET active = false WHERE id = 1982;

Step 4 - Verify
  SELECT id, service_end FROM bookings WHERE id = 18151;
  SELECT id, class_id, week_end FROM student_class_assignments WHERE student_id = 1001 ORDER BY week_end DESC LIMIT 5;

RISK: bookings/class-assignments | reversible | single student | HIGH
