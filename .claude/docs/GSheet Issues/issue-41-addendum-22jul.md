Issue 41 Addendum 22 Jul 2026 - Giampaolo Russo: Capel Missing, Xero Null 26d, Check-in 11d

Sheet row: 43 | Check: 40th hourly Wed 22 Jul 2026 UTC

Root cause (fresh DB):
- Booking 18180 (Giampaolo Russo, student 14571): confirmed=true
- Accommodation BA11357 (bed 178, Home/host family, 2 Aug to 6 Sep 2026): active=true, fee EUR 1250 - in place
- Capel apartment (6 Sep to 14 Sep 2026, ~EUR 530): STILL NOT in database. bk18180 has only 1 accommodation record.
- Payment 17954 (EUR 2584.96, Bank Transfer, 26 Jun 2026): xeroPaymentId=null, type=null - 26 days unreconciled.
- BC24956 (General English AM, 3 Aug to 11 Sep 2026): 0 class assignments, active=true.
- Check-in date: 2 Aug 2026 = 11 calendar days away.

Fix recipe (NOT YET RUN):
1. Add Capel apartment to booking 18180:
   SIS > Bookings > Booking 18180 > Add Accommodation
   Property: Capel Street (apartment) | Dates: 6 Sep 2026 to 14 Sep 2026 | Fee: EUR 530 (verify with Diego)
2. Reconcile payment 17954 in Xero:
   Find EUR 2584.96 Bank Transfer 26 Jun 2026 for Giampaolo Russo in Xero
   Match to invoice and record xeroPaymentId on payment record 17954
3. Assign BC24956 to appropriate General English AM class (0 SCAs - check-in Aug 3 = first teaching day)

Risk: Money/bookings. Reversible. Check-in Aug 2 = 11 days.

Status: OPEN - Fix NOT RUN
Last checked: Wed 22 Jul 2026 UTC