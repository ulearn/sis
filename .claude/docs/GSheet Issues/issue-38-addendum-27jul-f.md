Issue 38 - Aug Bank Holiday - Addendum 27 Jul 2026 (f)

Reporter: various | Area: Holidays | Sheet row: 40 | Last checked: 2026-07-27 UTC

Root Cause (fresh DB 2026-07-27)

9 school_closures in DB: Good Friday 2026-2030 + Christmas 2026-2029. Aug Bank Holiday Mon 3 Aug 2026 NOT in table. 17 active booking_courses have start_date=2026-08-03. DEADLINE: Fri 31 Jul 2026 (4 days).

Fix Recipe (NOT YET RUN)

  INSERT INTO school_closures (created_at, name, start_date, end_date, note, is_paid_holiday)
  VALUES (NOW(), 'August Bank Holiday', '2026-08-03', '2026-08-03', 'Ireland public holiday', false);

  Verify: SELECT * FROM school_closures WHERE start_date = '2026-08-03';

Risk: bookings/holidays. Reversible: yes. 17 BCs starting Aug 3.

Status: OPEN - DEADLINE Fri 31 Jul. Fix NOT RUN. Last checked: 2026-07-27 UTC
