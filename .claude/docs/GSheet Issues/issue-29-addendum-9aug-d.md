Issue 29 and 15 -- Saikhantes Shagdarsuren (Student 1001, Booking 18151): service_end Expired
Check: 65th, Sun 9 Aug 2026 UTC | Reporter: pg | Row: 30

ROOT CAUSE (fresh query Sun 9 Aug 2026 UTC)
Booking 18151 (Saikhantes Shagdarsuren, Stu 1001): status = CONFIRMED, confirmed = true.
service_end = 2026-08-07 -- expired 2 days ago (today is Aug 9).
EUR 1,339.20 fully paid (amount_open = 0).
Booking Course 24925 (Academic Year Afternoon): start 2026-03-09, end 2026-10-02, active = true.
Booking service_end should match course end: 2026-10-02.

FIX RECIPE -- NOT YET RUN

  UPDATE bookings
  SET service_end = '2026-10-02', updated_at = NOW()
  WHERE id = 18151;

Verify:
  SELECT id, service_end FROM bookings WHERE id = 18151;
  Expect: service_end = 2026-10-02

RISK: Category=Data hygiene / bookings | Reversible=Yes
Blast radius: Single booking (18151) -- service_end display and expiry-based logic
Priority: Low-urgency for operations; booking shows as past-service since Aug 8

STATUS: Open -- Fix NOT RUN
Last checked: Sun 9 Aug 2026 UTC (65th check)