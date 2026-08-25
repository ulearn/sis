# Issue 15 - Saikhantes Shagdarsuren: service_end Expired, Course Still Active (Mon 10 Aug - 2nd check)

Reporter: AC | Area: booking/class | Sheet rows: 16 (Issue 15) and 30 (Issue 29 and 15)

## Root Cause (92nd check - Mon 10 Aug 2026 UTC)
Booking 18151 service_end = 2026-08-07 (3 days expired), but active Booking Course ends 2026-10-02.

Evidence:
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed = true
- amount_paid = EUR 1,339.20, amount_total = EUR 1,339.20 (fully paid, EUR 0 open)
- service_start = 2026-01-12, service_end = 2026-08-07 - expired 3 days ago
- Booking Course 24925 (Academic Year Afternoon): start_date 2026-03-09, end_date 2026-10-02, active = true
- Student is in school until October - service_end wrong by ~55 days

## Fix Recipe (NOT YET RUN)
Step 1: Verify no accommodation or other service extends beyond 2026-10-02:
  SELECT ba.id, ba.start_date, ba.end_date, ba.active FROM booking_accommodations ba WHERE ba.booking_id = 18151;

Step 2: Update service_end:
  -- NOT YET RUN
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Step 3 - Verify:
  SELECT id, service_start, service_end FROM bookings WHERE id = 18151;
  -- service_end should be 2026-10-02

## Risk
Category: bookings / data-hygiene | Reversible: yes | Blast radius: 1 student (Saikhantes Shagdarsuren)

## Status: OPEN - service_end expired 3 days ago; fix not run
Last checked: 2026-08-10 UTC (92nd hourly check)