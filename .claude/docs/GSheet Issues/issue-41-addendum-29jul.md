# Issue 41 - Giampaolo Russo - 148th check Wed 29 Jul 2026 UTC

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

## Symptom
Student booked host family (2 Aug - 6 Sep) and Capel St apartment (6-14 Sep 2026). Capel absent in SIS.

## Root cause (live DB, Wed 29 Jul 2026)
- Booking 18180 (Giampaolo Russo, student 14571): EUR 2584.96 paid, CONFIRMED, amountOpen = 0
- Booking accommodation 11357 (bed 178, host family, EUR 1250): 2 Aug-6 Sep 2026, active = true - present
- Capel apartment (6 Sep - 14 Sep 2026): ABSENT from booking_accommodations - only 1 BA on booking
- Booking course 24956 (General English AM, starts 3 Aug): unshunted - depends on Issue 38 fix
- Host family check-in: Sun 2 Aug 2026 (4 days away)

## Fix recipe (NOT YET RUN)

Step 1 - Fix Issue 38 first: BC 24956 needs to shift to 2026-08-04 (Aug BH shunt).

Step 2 - Add Capel Street apartment BA to booking 18180:
  Via SIS admin: Booking 18180 -> Accommodation -> Add:
    Type: Apartment (Capel Street, premium room)
    Start date: 2026-09-06, End date: 2026-09-14
    Bed: assign appropriate Capel Street bed
    Fee: verify from HubSpot deal for this student

Step 3 - Confirm host family matching assignment complete for BA 11357 (bed 178, Aug 2 - Sep 6).

## Risk
Category: bookings/accommodation | Reversible: yes | Blast radius: 1 student; check-in Sun 2 Aug (4 days).

## Status
URGENT - FIX NOT RUN. Host family present (BA 11357 bed 178). Capel absent. Check-in Sun 2 Aug (4 days).

Last checked: Wed 29 Jul 2026 UTC (148th hourly check)