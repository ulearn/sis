# Issue 41 Addendum 22 Jul 2026 e

Reporter: Diego/AC | Area: Booking/Accommodation | Sheet row: 43
Last checked: Wed 22 Jul 2026 UTC (44th hourly, 95th total)

## Status
UNCHANGED. Capel Street accommodation still missing. Xero payment still null.

## Root Cause
Booking 18180 (Giampaolo Russo, student 14571) — confirmed=true, paid EUR 2584.96.

DB state (verified this run):
- BA11357: bed 178 (host family), 2 Aug to 6 Sep 2026, active=true — in place
- Capel Street apartment (6 Sep to 14 Sep 2026): NOT in database — zero booking_accommodation records for this period
- BC24956: General English AM, 3 Aug to 11 Sep 2026, active=true, zero class assignments
- PM17954: EUR 2584.96, Bank Transfer, 26 Jun 2026 — xeroPaymentId=null (26 days unreconciled)
- Student check-in: 2 Aug 2026 — 11 calendar days away

## Fix Recipe (NOT YET RUN)
1. Add Capel Street accommodation to booking 18180 in SIS:
   - Dates: 6 Sep to 14 Sep 2026
   - Fee: confirm with Diego (~EUR 530 for 1 week + 1 night)
   NOT YET RUN — SIS admin UI

2. Reconcile payment 17954 in Xero:
   - EUR 2584.96 Bank Transfer, 26 Jun 2026 — link to invoice for booking 18180
   NOT YET RUN — Xero action

3. Assign BC24956 (General English AM, 3 Aug to 11 Sep) to a class:
   NOT YET RUN — SIS admin UI

## Risk
bookings, accommodation, accounts — reversible — urgency HIGH: check-in 2 Aug (11 days)

## Last checked: Wed 22 Jul 2026 UTC — UNCHANGED
