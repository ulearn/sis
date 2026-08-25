Issue 27 - BK17909 CANCELLED but confirmed=true - 30 Jul 2026 UTC (36th check)
------------------------------------------------------------------------------
Root cause (unchanged):
- Booking 17909 (Sofiia Korkishchenko, student 768): CANCELLED, confirmed=STILL true (anomaly).
- Last updated 17 Jun 2026 -- 43 days stale.
- Amount open = EUR 727.50, amount paid = EUR 0 -- no payments on this booking.
- Booking course 24693 (Renewal AY PM, 25 May-13 Nov 2026): active=true -- orphaned (booking CANCELLED).
- Related: Issue 7 (row 8) tracks payment anomaly on same BK17909 (EUR 455.5 excess, null xeroIds PMT17477+PMT17478).

Fix recipe (NOT YET RUN):
1. UPDATE booking SET confirmed = false WHERE id = 17909;
2. UPDATE booking_course SET active = false WHERE id = 24693;
3. Verify Sofiia active booking (from 8 Jun 2026) correctly tracked in HubSpot.
(Coordinate with Issue 7 before closing either issue.)

Risk: bookings; both steps reversible. Status: OPEN - unchanged since 29 Jul 2026.
Last checked: Thu 30 Jul 2026 UTC
