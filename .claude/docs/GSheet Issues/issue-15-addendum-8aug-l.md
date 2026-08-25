Issue 15 -- Saikhantes service_end Expired (78th check, 8 Aug 2026)
Reporter: Staff | Area: Booking/Class | Sheet row: 16

Root cause: serviceEnd on booking 18151 = 2026-08-07 (expired 2 days ago).
Active Booking Course 24925 (AY Afternoon) runs to 2026-10-02 -- 55 days remaining.
Booking 18151: CONFIRMED, confirmed=true, amountPaid=EUR 1,339.20. Unchanged from last check.

Fix (NOT YET RUN):
UPDATE bookings SET serviceEnd = '2026-10-02' WHERE id = 18151;
Or SIS admin: Booking 18151 -> edit service end -> 2 Oct 2026.

Category: Data hygiene | Reversible: Yes | Blast: 1 student
Last checked: 2026-08-08 UTC (78th check)