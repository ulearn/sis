Issue 41 -- Giampaolo Russo dual accommodation -- Addendum 21 Jul 2026 (24th hrly)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Root cause (76th check, Tue 21 Jul 2026 UTC):

Payment 17954 (Giampaolo Russo, student 14571):
  Amount: EUR 2584.96, Bank Transfer, paid 26 Jun 2026
  Booking 18180, HubSpot payment 1268783973563
  xero_payment_id = STILL null -- 25 days unreconciled
  type = STILL null
  UNCHANGED from 23rd hourly check

Booking 18180: CONFIRMED, EUR 2584.96/2584.96 fully paid.
Booking course 24956 (General English AM, 3 Aug to 11 Sep 2026): active=true, 13 days to start.
Accommodation 11357 (bed 178, Host Family, 2 Aug to 6 Sep 2026): claimStatus=confirmed (6 Jul), active=true -- 12 days to check-in.
Capel Street accommodation (6-14 Sep 2026): STILL absent from DB for student 14571.
  (Booking 17980 = student 14521 Pietro Caccianiga, not Giampaolo -- confirmed fresh DB.)

Fix recipe (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180:
   SIS > Student 14571 > Booking 18180 > Accommodation > Add
   Type: City Centre Apartment (Capel Street); Dates: 6 Sep to 14 Sep 2026; fee: confirm from HubSpot deal.
2. Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice.

Risk: bookings / accounts; reversible; blast radius one student. Aug 2 check-in 12 days.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (24th hourly)
