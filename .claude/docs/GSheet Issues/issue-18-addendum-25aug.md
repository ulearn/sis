Issue 18 Addendum 25 Aug 2026

42nd check Tue 25 Aug 2026 UTC
Student 983 (Flávia Nascimento Mariano): visa_status = null, last updated 2026-08-19
Booking 1534: CONFIRMED, confirmed = true, amount paid EUR 1308, amount open EUR 0 (fully paid)
Payment 17035: EUR 250, Bank Transfer, xero_payment_id = null
Payment 17527: EUR 1058, Bank, xero_payment_id = null (sum = EUR 1308 correct)
Booking Course 1710 (Academic Year Afternoon): ends 2026-11-27, active = true, student in school
No change from 41st check (Mon 24 Aug).

Fix (NOT YET RUN):
1. Verify visa approval in HubSpot deal
2. UPDATE students SET visa_status = Approved WHERE id = 983
3. Find EUR 250 (May 5 2026) in Xero, UPDATE payments SET xero_payment_id = XeroId1 WHERE id = 17035
4. Find EUR 1058 (May 28 2026) in Xero, UPDATE payments SET xero_payment_id = XeroId2 WHERE id = 17527

Risk: data-hygiene | reversible | student 983 only
Status: Open. Last checked: 2026-08-25 UTC (520th run, 42nd issue check)