# Issue 38 addendum 29 Jul 2026 run C

154th hourly check. Data UNCHANGED since run B.

DEADLINE: Fri 31 Jul 2026 (2 days remaining)

## Confirmed state (live DB, 29 Jul 2026 UTC)
- school_closures has 9 entries; Aug BH 2026-08-03 is ABSENT
- 20 booking courses start on 2026-08-03 (will run on a bank holiday if not shunted)
- BC 25003 is duplicate of BC 25002 (booking 18225) — deactivate also

## Fix recipe (NOT YET RUN)

Step 1 — Add closure:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true);

Step 2 — Shunt 20 BCs to start 2026-08-04:
  UPDATE booking_courses SET start_date = 2026-08-04
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25010,25016,25028,25029,25030);

Step 3 — Deactivate duplicate BC 25003:
  UPDATE booking_courses SET active = false WHERE id = 25003;

## Risk
Category: bookings/holidays | Reversible: yes | Blast radius: 20 booking courses + 1 dedup.
Missing closure: students appear on attendance on a closed day; cert dates wrong.

## Status
OPEN - Fix NOT RUN - DEADLINE FRI 31 JUL 2026 (2 days)
Last checked: Wed 29 Jul 2026 UTC (154th hourly check)