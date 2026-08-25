# Issue 41 — Giampaolo Russo Dual Accommodation (Addendum 21 Jul, run i)
Reporter: KC | Area: Booking / Accomm | Sheet row 43 | 35th hourly check (87th total) Tue 21 Jul 2026 UTC

## Symptom
Student booked Host Family (Aug 2 - Sep 6) + Capel Street apartment (Sep 6 - Sep 14). Only Host Family in SIS.

## Current Status (fresh DB, no change from run h at 18:15)
- Booking 18180 (Giampaolo Russo, student 14571)
- BA11357: bed 178, Host Family, 2 Aug - 6 Sep 2026, active=true, claimStatus=confirmed OK
- Capel apartment (Sep 6 - Sep 14 2026, approx EUR 530): still NOT added to booking
- Payment 17954: EUR 2584.96, Bank Transfer, paid 26 Jun 2026, xeroPaymentId=null — 26 days unreconciled
- Check-in: 12 days away (Aug 2)

## Fix Recipe (NOT YET RUN)
1. Add Capel Street accommodation to booking 18180 in SIS admin (Booking > Add Accommodation):
   - Type: Apartment / Capel Street
   - Dates: 6 Sep - 14 Sep 2026
   - Fee: EUR 530 (verify against Diego's records)
2. Reconcile payment 17954 (EUR 2584.96) in Xero — locate the Bank Transfer and record xeroPaymentId.
3. Verify totals: Host Family EUR 1250 x 5wks = EUR 6250 + Capel EUR 530 = verify against booking total.

Full background: issue-41-giampaolo-dual-accomm.md

## Risk / Category
- Category: bookings / money
- Reversible: yes
- Blast radius: 1 student; check-in 12 days — must be fixed before Aug 2 for bed allocation

## Status
OPEN — 35th hourly check, no fix run yet.
Last checked: 2026-07-21 UTC