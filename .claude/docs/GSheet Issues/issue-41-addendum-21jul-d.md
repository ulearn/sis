Issue 41 -- Giampaolo Russo dual accommodation -- Addendum 21 Jul 2026 (25th hrly)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Root cause (77th check, Tue 21 Jul 2026 UTC):

Booking 18180 (Giampaolo Russo, student 14571): status=CONFIRMED, confirmed=true
- Payment 17954 (EUR 2584.96, Bank Transfer): xero_payment_id = STILL null -- 25 days unreconciled in Xero (paid 26 Jun 2026)
- BA11357 (Host Family, bed 178, Aug 2 to Sep 6 2026): active=true, claimStatus=confirmed
- Capel Street accommodation Sep 6-14 2026: STILL absent from DB
- BC24956 (General English AM, Aug 3 to Sep 11 2026): active=true
- Aug 2 check-in: 12 days away
- UNCHANGED from 24th hourly check

Fix recipe (NOT YET RUN):
1. Reconcile payment 17954 (EUR 2584.96) in Xero -- match to bank transfer receipt from Giampaolo 26 Jun 2026
2. Add Capel Street accommodation to booking 18180 in SIS:
   - Bed: Capel Street premium room for Sep 6 to Sep 14 2026
   - SIS > Booking 18180 > Add Accommodation > Capel / Premium > Sep 6-14

Risk: bookings + money. Reversible. Aug 2 check-in 12 days.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (25th hourly)
