# Issue 41 — Giampaolo Russo (addendum Fri 24 Jul 2026 UTC, 160th total / 82nd hourly)

- Reporter: KC | Area: Booking / Accomm | Sheet row 43
- Student: Giampaolo Russo (ID 14571) | Booking 18180

## Symptom (verbatim col G)
Diego mentioned that the student booked two types of accommodation: Host family and an apartment.
Host family: Aug 2 – Sep 6 2026 (5 weeks).
Capel Street premium room: Sep 6 – Sep 14 2026 (1 week + 1 extra night).
Neither appeared in SIS or Matching section.

## Root Cause (live data, 24 Jul 2026 UTC)
- Booking 18180: Confirmed, confirmed = true, fully paid EUR 2,584.96.
- Accommodation BA 11357 (Host Family, Individual, Half Board, Aug 2 – Sep 6, bed 178):
  active = true, claimStatus = "confirmed", claimedAt 2026-07-01 via host-portal.
  Host family accommodation IS assigned and provider HAS confirmed.
- Capel Street apartment (Sep 6 – Sep 14 2026): NOT IN booking 18180 — still missing.
- Payment 17954 (EUR 2,584.96, Bank, paid 2026-06-26): xeroPaymentId = null. 28 days unreconciled.
- Host Family check-in: Sun 2 Aug 2026 = 9 calendar days from today.

## Fix Recipe (NOT YET RUN)

### Step 1 — Add Capel Street accommodation to booking 18180
In SIS admin: booking 18180 > Add Accommodation:
  Type: Apartment (Capel Street / premium room)
  Start: 2026-09-06
  End: 2026-09-14
  Fee: per agreed rate
This fixes the missing second accommodation block.

### Step 2 — Reconcile payment 17954 in Xero
Payment 17954: EUR 2,584.96, Bank, paid 26 Jun 2026. xeroPaymentId = null after 28 days.
In Xero: locate the bank transfer and match to this payment, then update SIS if needed.

### Step 3 — No action on Host Family
BA 11357 (bed 178) is confirmed by provider. Nothing to do here.

## Risk / Category
- Bookings / Xero: medium. Adding accommodation is reversible; Xero reconciliation is low-risk.
- Check-in is Sun 2 Aug (9 days). Capel Street not needed until Sep 6.

## Status
Host family: assigned and confirmed. Capel Street: MISSING. Xero payment: unreconciled (28d). Fix NOT RUN.

## Last checked
Fri 24 Jul 2026 UTC (160th total check, 82nd hourly on issue 41)
