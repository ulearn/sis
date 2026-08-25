Issue 29 and 15 (62nd check Sun 9 Aug 2026) -- Sheet row 30

Booking 18151 (Saikhantes Shagdarsuren): service_end = 2026-08-07 -- EXPIRED 2 DAYS AGO
  status=CONFIRMED, confirmed=true, amount_paid=EUR 1339.20, amount_open=EUR 0
Booking Course 24925 (Academic Year Afternoon): ends 2026-10-02, active=true

Fix recipe (NOT YET RUN):
  UPDATE bookings SET service_end = [2026-10-02] WHERE id = 18151;
  (replace [ ] with single quotes)
  Verify: SELECT id, service_end FROM bookings WHERE id = 18151;

Same fix as Issue 15 (see issue-15-addendum-8aug-j.md).
Risk: Data hygiene. Reversible. Blast: 1 student.
Status: NOT RUN | Last checked: 2026-08-09 UTC (62nd check)
