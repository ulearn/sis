Issue 41 -- Giampaolo Russo (addendum Sat 25 Jul 2026 UTC)

Sheet row: 43 | Area: Booking / Accomm

Current DB state (Sat 25 Jul 2026 UTC):
  Student 14571 Giampaolo Russo, hubspotContactId=803499480264, visaStatus=null
  BK 18180 CONFIRMED confirmed=true, amtPaid=EUR 2584.96, amtTotal=EUR 2584.96 (fully paid)
  BC 24956: General English AM, Aug 3 to Sep 11, fee=EUR 804.96
  BA 11357: Aug 2 to Sep 6, bedId=178, Room 2 at Patty McSweeney (5 Claremont Close, Glasnevin), fee=EUR 1250 confirmed
  Capel apartment BA: MISSING -- no second BookingAccommodation record exists for BK 18180
  Payment 17954: EUR 2584.96, Bank, Jun 26, xeroPaymentId=null (29 days old)

Amount reconciliation:
  Course fee:      EUR 804.96
  Host family fee: EUR 1250.00
  Total accounted: EUR 2054.96
  Amount total:    EUR 2584.96
  Unaccounted:     EUR 530.00 (likely the Capel apartment fee -- not confirmed)

Capel properties in SIS:
  Property id 2:  A1, 32 Capel Street (provider: Capel Street)
  Property id 82: A2, 32 Capel Street (provider: Capel Street)

Check-in: Aug 2 = 9 calendar days away

Fix recipe (NOT YET RUN):
Step 1 -- Confirm Capel details with Diego:
  Which property (A1=id 2 or A2=id 82)? Which room/bed? Dates? Fee (EUR 530?)
Step 2 -- Create missing BA in SIS admin UI:
  Booking 18180, type: Apartment, 32 Capel Street, dates TBD, fee EUR 530 (TBC)
Step 3 -- Reconcile Xero:
  Payment 17954 (EUR 2584.96, Jun 26) xeroPaymentId=null -- reconcile via Hub fins/

Risk: Moderate -- check-in Aug 2 (9 days); Capel unallocated; Xero 29 days stale.
Last checked: Sat 25 Jul 2026 UTC
