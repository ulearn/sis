Issue 26 - BC23+BC24826 stale; BK18034 EUR 250 open - 30 Jul 2026 UTC (44th check)
------------------------------------------------------------------------------------
Root cause (unchanged):
- Booking course 23 (Intensive General 30, ended 22 May 2026, booking 22): active=true -- 69 days stale.
- Booking course 24826 (2 wks Intensive General 30, ended 19 Jun 2026): active=true -- 41 days stale.
- Booking 22 (student 18): CONFIRMED, EUR 1948/1948 fully paid -- no issue.
- Booking 18034: PARTIAL, confirmed=false, EUR 845 paid / EUR 1,095 total (EUR 250 open). Last updated 7 Jun 2026 (53 days stale).
- Payment 17683 (EUR 845): Bank, 23 Apr 2026, xeroPaymentId=null -- 98 days without Xero link.

Fix recipe (NOT YET RUN):
1. UPDATE booking_course SET active = false WHERE id IN (23, 24826);
2. Chase EUR 250 balance on BK18034 via HubSpot deal.
3. Link PMT17683 (EUR 845) in Xero.
4. If EUR 250 received: UPDATE booking SET status = CONFIRMED, confirmed = true WHERE id = 18034;

Risk: money (EUR 250 open + EUR 845 Xero gap); BC deactivation reversible.
Status: OPEN - unchanged since 29 Jul 2026. Last checked: Thu 30 Jul 2026 UTC
