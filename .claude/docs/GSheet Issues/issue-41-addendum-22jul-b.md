# Issue 41 — Giampaolo Russo dual accommodation — Addendum 22 Jul 2026 run B

**Reporter:** Diego / AC | **Area:** Booking / Accommodation | **Sheet row:** 43
**Last checked:** Wed 22 Jul 2026 UTC — 41st hourly run, 92nd check overall

## Root cause (confirmed unchanged)

Fresh DB query Wed 22 Jul 2026:
BK18180 (Giampaolo Russo, s14571): CONFIRMED, EUR 2584.96/2584.96 fully paid.

Accommodations:
- Accomm 11357: Host Family, 2 Aug to 6 Sep 2026, bed 178, Patty McSweeney, fee EUR 1250, active (OK)
- Capel apartment (6 Sep to 14 Sep 2026): STILL MISSING from booking_accommodations

Payment 17954: EUR 2584.96, Bank Transfer, 26 Jun 2026 — xero_payment_id = null, type = null (26 days unreconciled)
BC24956: General English AM, 3 Aug to 11 Sep 2026 — 0 class assignments
Check-in: 2 Aug 2026 (11 calendar days away)

## Fix recipe (NOT YET RUN)

Step 1 — Add Capel apartment to BK18180:
  SIS admin > Students > 14571 > BK18180 > Accommodations > Add
  Type: Apartment / Capel Street; Start: 2026-09-06; End: 2026-09-14; Weeks: 1; Fee: confirm (~EUR 530)

Step 2 — Reconcile payment 17954 in Xero:
  Xero > Find EUR 2584.96 bank transfer ~26 Jun 2026 from Giampaolo Russo
  Match to ULearn invoice for BK18180; record Xero payment ID in SIS

Step 3 — Assign class to BC24956:
  SIS admin > Students > 14571 > BK18180 > BC24956 > Assign Class > General English AM > Save

## Risk
Category: bookings / accommodation / accounts. Reversible. Blast radius: single student. Check-in 11 days.

## Status
OPEN — fix NOT RUN — 41st hourly check Wed 22 Jul 2026 UTC (run B)
