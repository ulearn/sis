# Issue 41 — Giampaolo Russo: Dual Accommodation + 0 SCAs (Addendum 28 Jul 2026 — 140th check)

Reporter: Diego | Area: Booking / Accomm | Sheet row: 43

## Current State (Tue 28 Jul 2026 UTC — 140th check)

CONFIRMED UNCHANGED (fresh DB).

- Booking 18180 (Giampaolo Russo, student 14571): Confirmed, EUR 2584.96/2584.96 fully paid
- Booking accommodation 11357: Host Family, bed 178, 2 Aug-6 Sep 2026, active=true, EUR 1250
- Capel apartment (6 Sep-14 Sep 2026): ABSENT from booking_accommodations — never created
- Booking course 24956 (General English AM, 3 Aug-11 Sep 2026): 0 class assignments — starts Mon 3 Aug
- Note: BC 24956 start date also depends on Issue 38 (Aug Bank Holiday shunt)
- HOST FAMILY CHECK-IN: Sun 2 Aug 2026 — 5 days away

## Fix Recipe (NOT YET RUN)

Step 1: Create Capel apartment booking accommodation via SIS Admin:
  Booking 18180 > Add Accommodation
  Type: Apartment / Capel Street premium
  Start: 2026-09-06 | End: 2026-09-14
  Fee: confirm from HubSpot deal | Neil to select specific Capel bed

Step 2: Assign BC 24956 to AM General class:
  SIS Admin > Classes > To Be Assigned > Giampaolo Russo > assign to AM class

Step 3: After Issue 38 fixed — verify BC 24956 shunts from Aug 3 to Aug 4.

Step 4: Reconcile payment 17954 (EUR 2584.96, type=null, xeroPaymentId=null) in Xero.

## Risk

Category: bookings/accommodation | Reversible: yes | Single student | Time-critical

## Status

OPEN — HOST FAMILY CHECK-IN SUN 2 AUG (5 days). Fix NOT RUN.

## Last Checked

Tue 28 Jul 2026 UTC (140th hourly check)