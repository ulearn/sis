# Issue 41 Addendum 22 Jul 2026 d

Reporter: Diego | Area: Booking/Accomm | Sheet row: 43
Last checked: Wed 22 Jul 2026 UTC (43rd hourly, 94th total)

## Root Cause
Booking 18180 (Giampaolo Russo, student 14571). Check-in 2 Aug 2026 (11 days away).

1. Capel Street apartment (6 Sep to 14 Sep 2026): STILL MISSING from DB.
   Only BA11357 (bed 178, host family Patty McSweeney, 2 Aug to 6 Sep 2026) exists.
   Fee gap: EUR 2584.96 paid - EUR 1250 host family - EUR 804.96 course = EUR 530 (likely Capel fee).

2. Payment 17954 (EUR 2584.96, Bank Transfer, 26 Jun 2026): xeroPaymentId=null, 26 days unreconciled.

3. BC24956 (General English AM, 3 Aug to 11 Sep 2026): 0 class assignments.

Confirmed via fresh DB query Wed 22 Jul 2026 UTC. UNCHANGED.

## Fix Recipe (NOT YET RUN)
1. Add Capel apt to booking 18180 in SIS admin:
   Type: Apartment/Capel Street | Start: 6 Sep 2026 | End: 14 Sep 2026 | Fee: ~EUR 530 (verify with Diego).
2. Reconcile payment 17954 in Xero (EUR 2584.96 Bank Transfer, 26 Jun 2026).
3. Assign BC24956 to a General English AM class.

## Risk
Category: bookings, accommodations, accounts. Reversible: Yes. Blast radius: single student.
Urgency: HIGH - check-in Aug 2 (11 days).

## Status
Open. Capel apt missing, payment 17954 xeroId null, BC24956 unassigned. Fix NOT RUN.
Last checked: Wed 22 Jul 2026 UTC