Issue 41 - Giampaolo Russo (Capel Apartment Missing, Check-In 11 Days)
Reporter: KC | Area: Booking/Accomm | Sheet row: 43 | Last checked: 2026-07-22 UTC

Symptom: Giampaolo booked Host Family (2 Aug to 6 Sep) + Capel apt (6 Sep to 14 Sep). Only Host Family appears in SIS.

Root Cause:
- Booking 18180 (Giampaolo Russo, student 14571): 1 accommodation record only in DB.
- BA 11357: Host Family, Individual, 5 Claremont Close Glasnevin, bed 178, 2 Aug to 6 Sep 2026,
  EUR 1250, active. Claimed by provider 24 via host portal on 1 Jul 2026.
- Capel Street apartment (6 Sep to 14 Sep 2026): 0 rows in booking_accommodations for booking 18180.
- Payment 17954 (EUR 2584.96, Bank, 26 Jun 2026): xero_payment_id=null - 26 days unreconciled.
- Check-in Host Family: 2 Aug 2026 - 11 calendar days away.
- DB confirmed - Wed 22 Jul 2026 UTC (48th hourly, 98th total check).

Fix Recipe (NOT YET RUN):
1. SIS admin: add accommodation to booking 18180 for Capel Street:
   Type=Apartment, Location=Capel Street, Start=2026-09-06, End=2026-09-14, Weeks=1 + 1 extra night per report.
   Fee per HubSpot deal for student 14571.
2. Reconcile payment 17954 (EUR 2584.96) in Xero.
3. Ensure booking course for student 14571 is assigned to a class.

Risk: Category bookings/accomm+accounts. Reversible yes. Urgency HIGH - check-in 2 Aug (11 days).
Status: Open - fix NOT RUN. Wed 22 Jul 2026 UTC.