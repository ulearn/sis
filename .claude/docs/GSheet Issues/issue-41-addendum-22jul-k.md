# Issue 41 Addendum Wed 22 Jul 2026 run k

Reporter: staff | Sheet row 43

## Root cause
Booking 18180 (Giampaolo Russo, student 14571): only 1 accommodation in DB.
BA11357 (Host Family, bed 178, 2 Aug to 6 Sep 2026, active, EUR 1250): confirmed present.
Capel Street apartment booking (6 Sep to 14 Sep 2026): STILL MISSING from SIS.
Payment 17954 (EUR 2584.96, Bank Transfer, date 26 Jun 2026, hubspotPaymentId=1268783973563): xeroPaymentId = null, 26 days unreconciled.
Host Family check-in: 2 Aug 2026 (11 calendar days away).

## Fix recipe (NOT YET RUN)
1. SIS -> Booking 18180 -> Add Accommodation -> Capel Street premium room, 6 Sep to 14 Sep 2026 (1 week + 1 extra night as reported).
2. Xero: locate payment matching EUR 2584.96 on or around 26 Jun 2026 and link to SIS payment 17954 (hubspotPaymentId 1268783973563).
3. Verify accommodation: SELECT * FROM booking_accommodations WHERE booking_id = 18180;
4. Verify payment: SELECT xero_payment_id FROM payments WHERE id = 17954;

## Risk
Bookings + money, reversible. Blast radius: 1 student. Xero reconciliation needed before check-in Aug 2.

## Status
OPEN 55th hourly check 105th total. Fix NOT RUN.
Last checked: Wed 22 Jul 2026 UTC
