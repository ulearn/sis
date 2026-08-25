# Issue 36b Addendum 22 Jul 2026 b

Reporter: Diego | Area: Booking/Accomm | Sheet row: 38
Last checked: Wed 22 Jul 2026 UTC (41st hourly, 24th check)

## Root Cause
System-wide stale BAs (active=true, endDate < 2026-07-22): 11,175. Unchanged from prior check.

16 tracked BAs with real bed assignments (all still active, stale days as of 22 Jul):
BA9917 (+67d), BA11246 (+46d), BA30 (+38d), BA11165/11278/11280 (+25d each), BA11354 (+24d),
BA11167/11247/11339 (+18d each), BA11345 (+10d), BA11257/11365 (+4d each), BA11265 (+3d),
BA11180 (bed 84, Daniela Perozo Gil, bk81, +32d), BA11168 (bed 83, Diego Da Silva Saldanha, bk92, +32d).

## Fix Recipe (NOT YET RUN)
Step 1 - Deactivate 16 tracked BAs (NOT YET RUN):
  UPDATE booking_accommodation SET active=false
  WHERE id IN (9917,11246,30,11280,11167,11247,11339,11345,11257,11365,11265,11165,11278,11354,11180,11168);

Step 2 - System-wide deactivation (review count before running):
  UPDATE booking_accommodation SET active=false WHERE active=true AND end_date < CURRENT_DATE AND id > 2000;

Step 3 - Schedule nightly deactivation job to prevent recurrence.

## Risk
Category: data-hygiene, bookings. Reversible: Yes. Blast radius: display/reporting only.
Urgency: Low - cosmetic; 11k+ growing.

## Status
Open. 11,175 stale BAs, 16 tracked with beds. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC