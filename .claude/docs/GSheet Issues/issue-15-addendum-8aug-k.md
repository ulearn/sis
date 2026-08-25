Issue 15 -- Saikhantes service_end expired (77th check, 8 Aug 2026)
Reporter: Staff | Area: Booking/Class | Sheet row: 16

Root cause (77th check Sat 8 Aug 2026 UTC):
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed=true
- Amount paid EUR 1,339.20; amount open EUR 0
- service_end = 2026-08-07 -- expired 1 day ago (7 Aug)
- Active BC 24925 (AY Afternoon): 9 Mar 2026 to 2 Oct 2026, active=true (55 days remaining)
- Mismatch: service_end expired but course runs 55 more days

Fix (NOT YET RUN):
  UPDATE bookings SET service_end = cast('2026-10-02' as date) WHERE id = 18151;
  SELECT service_end FROM bookings WHERE id = 18151;

Category: Data-hygiene/bookings | Reversible: Yes | Blast: 1 student
Last checked: 2026-08-08 UTC (77th check)