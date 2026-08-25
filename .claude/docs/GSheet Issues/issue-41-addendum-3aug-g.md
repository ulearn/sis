Issue 41 Giampaolo Russo Dual Accommodation 3 Aug 2026 12th check today 76th overall

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43

Symptom: Student has two accommodation types. First class TOMORROW Tue 4 Aug 2026. No class assignment yet. Capel Street apartment not yet in SIS.

Root cause (confirmed fresh 12th check 3 Aug 2026 UTC):
- Student 14571 (Giampaolo Russo)
- Booking 18180: CONFIRMED, EUR 2584.96 paid, EUR 0 open
- Booking course 24956 (General English AM, start 2026-08-03, end 2026-09-11): active=true, 0 student class assignments
  Note: start_date 2026-08-03 (bank holiday today) — Issue 38 shunt must push to 2026-08-04 first
- Booking accommodation 11357 (bed 178, host family, 2026-08-02 to 2026-09-06): active=true, fee EUR 1250
- Capel Street apartment (2026-09-06 to 2026-09-14): NOT YET CREATED in SIS

Fix recipe (NOT YET RUN):

Step 0 - Run Issue 38 BH shunt first (pushes BC 24956 start_date from Aug 3 to Aug 4)

Step 1 - Create class assignment for week Aug 4:
  SIS admin > Booking 18180 > Booking course 24956 > Assign to class for week starting 2026-08-04

Step 2 - Add Capel Street accommodation:
  SIS admin > Booking 18180 > Add Accommodation
  Type: Apartment | Provider: Capel Street (check accommodation_properties for correct bed/room)
  Start date: 2026-09-06 | End date: 2026-09-14

Step 3 - Check documents:
  Verify LOA / invoice for booking 18180 reflects both accommodation entries and updated course dates

Risk: Bookings + Accommodation + Documents. 1 student; reversible; blast radius low.
CRITICAL: First class is TOMORROW (Tue 4 Aug) — class assignment is time-critical.

Status: OPEN - Fix NOT YET RUN
Last checked: Mon 3 Aug 2026 UTC (12th check today, 76th overall)