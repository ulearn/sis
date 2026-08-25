Issue 36b -- Pietro Caccianiga BA 11393 fee null + service_end mismatch (212th check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 38

Symptom
Accommodation fee not set for second period; booking service_end does not cover accommodation period.

Root cause (evidence)
- BA 11393: bed 88, Aug 22 to Sep 13, 4 weeks, fee = null, active = true; Bed 88 = Capel Street A2 Room 3 Bed A (provider 15)
- Booking 17980 service_end = 2026-08-21 -- BEFORE BA 11393 start Aug 22; needs extending to 2026-09-13
- No Xero invoice in SIS DB for Booking 17980 (invoices table 0 rows)
- BA 11311 (prev period, bed 84): Jun 28 to Aug 22, 8 wks, fee = EUR 3,850 (host family)
- Booking 17980: amount_total=EUR 5331, amount_paid=EUR 5331, amount_open=EUR 0
- Implied fee: bed 88 historical EUR 340/wk x 4wks = EUR 1,360 (unconfirmed; verify vs HS deal 501813359827)

Fix recipe (NOT YET RUN)
Step 1 -- Confirm agreed fee with Diego/KC for Capel A2 Bed A, 4 wks Aug 22 to Sep 13
Step 2 -- SET fee:  UPDATE booking_accommodations SET fee=<amount> WHERE id=11393;
Step 3 -- Extend service_end:  UPDATE bookings SET service_end='2026-09-13' WHERE id=17980;
Step 4 -- Check if Xero invoice needed (none in DB); raise in Xero/Hub if needed
Step 5 -- Verify: SELECT id,fee,start_date,end_date FROM booking_accommodations WHERE id IN(11311,11393);

Risk: Accommodation | Reversible | 1 student | DEADLINE Aug 22 check-in (4 days)
Status: OPEN -- fix NOT RUN. Check-in Aug 22. Fee null. service_end mismatch. No invoice.
Last checked: 2026-08-17 UTC (212th check)