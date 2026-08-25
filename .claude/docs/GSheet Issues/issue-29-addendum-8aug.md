Issue 29 and 15 - Saikhantes Shagdarsuren: service_end Expired (60th check, Sat 8 Aug 2026 UTC)

Reporter: (booking) | Area: Booking / Class | Sheet row: 30

SYMPTOM: Booking 18151 service_end=2026-08-07 expired 1 day ago; class runs to Oct 2 2026.

ROOT CAUSE (live 2026-08-08 UTC):
  Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed=true, fully paid EUR 1339.20
  service_end=2026-08-07 - expired 1 day ago (yesterday)
  Booking Course 24925 (Academic Year Afternoon): active=true, endDate=2026-10-02 - class continues
  SCA 255: class 11 (B1 PM), weekEnd=2026-07-03 - assignment covered through Jul 3 only
  Student on holiday until Aug 24 2026
  service_end (2026-08-07) too early - should match BC end (2026-10-02).

FIX RECIPE (NOT YET RUN) - see also Issue 15 (row 16):
  Step 1: UPDATE Booking SET service_end = 2026-10-02 WHERE id = 18151;
  Step 2: After student returns Aug 24 - create new SCA for class 11 (B1 PM) from Aug 25.

RISK: Bookings - service_end mismatch; reversible single field update. Fix needed before Aug 24.
Status: OPEN - Fix NOT RUN
Last checked: 2026-08-08 UTC (60th hourly check); see Issue 15 (row 16)