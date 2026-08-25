Issue 15 -- Saikhantes Service End Expired (80th check, 9 Aug 2026)
Reporter: Staff | Area: Booking/Class | Sheet row: 16

SYMPTOM
service_end on booking 18151 is expired while the active booking course runs to October 2026.

ROOT CAUSE (live DB, 9 Aug 2026 UTC)
Booking 18151 (Saikhantes Shagdarsuren, student 1001):
  - Status: CONFIRMED, confirmed = true
  - Amount paid: EUR 1,339.20 (fully paid)
  - serviceEnd = 2026-08-07 -- expired 2 days ago (today is Aug 9)
  - Booking Course 24925 (AY Afternoon): 2026-03-09 to 2026-10-02, 54 days remaining
  - Unchanged from 79th check (Sat 8 Aug 2026)

FIX RECIPE (NOT YET RUN)
  Option A: SQL
    UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151;
  Option B: SIS admin > Booking 18151 > edit serviceEnd > set to 2026-10-02

RISK: data-hygiene | Reversible: yes | Blast: 1 student (booking 18151)

STATUS: NOT RUN
Last checked: 2026-08-09 UTC (80th check)