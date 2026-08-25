# Issue 41 addendum 29 Jul 2026 run B

151st hourly check. Data UNCHANGED.

HOST FAMILY CHECK-IN: SUN 2 AUG 2026 (4 days)

## Confirmed state (live DB, 29 Jul 2026 UTC)
- Student 14571 (Giampaolo Russo), booking 18180: CONFIRMED, EUR 2584.96 paid, amountOpen = 0
- Booking accommodation 11357: bed 178, host family, 2 Aug to 6 Sep 2026, active = true OK
- Capel Street apartment (6 Sep to 14 Sep 2026): ABSENT from booking_accommodations
- Booking course 24956 (General English AM, starts 2026-08-03): needs Aug BH shunt to Aug 4

## Fix recipe (NOT YET RUN)

Step 1 — Fix Issue 38 first (Aug BH shunt will shift BC 24956 to Aug 4).

Step 2 — Add Capel Street apartment BA via SIS admin:
  Booking 18180 -> Accommodation -> Add new:
    Type: Apartment (Capel Street)
    Start date: 2026-09-06, End date: 2026-09-14
    Bed: assign available Capel Street bed (check availability)
    Fee: confirm from HubSpot deal / Diego

Step 3 — Confirm bed 178 host family assignment communicated to host for Aug 2 check-in.

## Risk
Category: bookings/accommodation | Reversible: yes | Blast radius: 1 student.
Capel absence: no SIS record for Sep accommodation. Host family check-in Aug 2 looks OK.

## Status
OPEN - Fix NOT RUN - Host family OK (bed 178). Capel Sep 6-14 ABSENT. Check-in Sun 2 Aug (4 days).
Last checked: Wed 29 Jul 2026 UTC (151st hourly check)