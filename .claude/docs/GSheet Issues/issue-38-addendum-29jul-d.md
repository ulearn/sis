Issue 38 - August Bank Holiday Missing (Addendum 29 Jul 2026 run D)

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Root cause (verified Wed 29 Jul 2026 UTC - 155th hourly check)
- school_closures has 9 entries: Good Fridays and Christmases 2026-2030 ONLY
- August Bank Holiday 2026-08-03 ABSENT - confirmed fresh this run
- 20 booking courses (active=true) start on 2026-08-03, need shunting to 2026-08-04
- BC 25003 is duplicate of BC 25002 on booking 18225

DEADLINE: Fri 31 Jul 2026 - 2 days remaining

Fix recipe (NOT YET RUN)

Step 1 - Insert Aug BH closure:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);

Step 2 - Shunt 20 BCs to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE start_date = '2026-08-03' AND active = true;

Step 3 - Deactivate duplicate BC 25003:
  UPDATE booking_courses SET active = false WHERE id = 25003;

Risk: bookings/holidays | Reversible: yes | Blast radius: 20 BCs + 1 closure + 1 dedup.

Status: OPEN - Fix NOT RUN - DEADLINE FRI 31 JUL 2026 (2 days)
Last checked: Wed 29 Jul 2026 UTC (155th hourly check)