# Issue 36b — Pietro Caccianiga Accommodation (484th run, Sun 23 Aug 2026 UTC)

Reporter: KC | Area: Booking / Accomm | Sheet row: 38

## Root cause
- Student 14521 (Pietro Caccianiga), booking 17980: CONFIRMED, paid=EUR 5,331, total=EUR 5,331
- BA 11311 (bed 84): 2026-06-28 to 2026-08-22 — ended YESTERDAY, fee=EUR 3,850, still active (1d past checkout)
- BA 11393 (bed 88): 2026-08-22 to 2026-09-13 — started yesterday, fee=null, active=true (day 1)
- BC 24772 (General English AM): ends 2026-09-11, active=true (19 days remaining)
- Fix NOT RUN (also unfixed on 452nd run, 22 Aug)

## Fix recipe (NOT YET RUN)

Step 1 — Deactivate BA 11311 (checkout was yesterday):
  UPDATE booking_accommodations SET active = false WHERE id = 11311;

Step 2 — Set fee on BA 11393 (Aug 22 – Sep 13 = 22 days = 3.14 weeks; check host rate):
  UPDATE booking_accommodations SET fee = <agreed_weekly_rate * 3.14> WHERE id = 11393;

Step 3 — Verify:
  SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodations WHERE id IN (11311, 11393);

## Risk / category
- Category: bookings / data-hygiene | Reversible: yes | Blast radius: booking 17980 only

Status: OPEN — Fix NOT RUN (1 day past checkout for BA 11311)
Last checked: 2026-08-23 UTC (484th run)