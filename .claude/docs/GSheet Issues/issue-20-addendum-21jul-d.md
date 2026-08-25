Issue 20 -- Ariunsarnai Batbayar payment pending -- Addendum 21 Jul 2026 (25th hrly)

Reporter: PG | Area: Booking / Class | Sheet row: 21

Root cause (39th check, Tue 21 Jul 2026 UTC):

Booking 1605 (Ariunsarnai Batbayar, student 1047):
- Status: PENDING, confirmed = false
- Day 99 since booking created 13 Apr 2026
- Amount paid: EUR 0 / EUR 1509 total
- Booking last updated 23 Jun 2026 -- 28 days with no activity
- BC1791: Academic Year Renewal Morning, 13 Apr to 23 Oct 2026, active=true
- HubSpot deal 502951083215 -- enrolment decision needed
- UNCHANGED from 24th hourly check

Fix recipe (NOT YET RUN):
1. Check HubSpot deal 502951083215 -- confirmed or cancel?
2. If confirmed: advance deal to Won, link payment, flip booking status to CONFIRMED
3. If not proceeding: cancel booking 1605 in SIS, update HubSpot deal to Lost

Risk: bookings; reversible. Day 99 with no payment.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (25th hourly)
