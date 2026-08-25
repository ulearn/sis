# Issue 15 -- Saikhantes Shagdarsuren: service_end 2 Days Expired
Check: 89th, Sun 9 Aug 2026 UTC | Reporter: (staff) | Row: 16

ROOT CAUSE
Booking 18151 (Saikhantes Shagdarsuren): Confirmed, confirmed = true, EUR 1,339.20 paid, EUR 0 open.
service_end = 2026-08-07 -- now 2 days past.
Actual course end should be 2026-10-02 (Booking Course 1810 active through Jan 2027 per Issue 48).
Issue 29 (row 30) tracks the same booking -- same fix required.

FIX RECIPE -- NOT YET RUN

UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;

Verify:
  SELECT id, status, service_end FROM bookings WHERE id = 18151;
  Expect: service_end = 2026-10-02

RISK: Category=Bookings/Data | Reversible=Yes
Blast radius: Single student; service_end display only (no class/attendance impact confirmed)

STATUS: Open -- Fix NOT RUN
Last checked: Sun 9 Aug 2026 UTC (89th check) | service_end 2 days past (expired 7 Aug)
