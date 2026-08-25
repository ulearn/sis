Issue 20 addendum 470th check Sun 23 Aug 2026
Ariunsarnai Batbayar -- EUR 1,509 pending, day 132, 61d left

Root cause:
- Booking 1605: PENDING, confirmed=false, EUR 0 paid, EUR 1,509 open.
- BC 1791 Academic Year Renewal Morning: 13 Apr -- 23 Oct 2026, active=true, 0 SCAs.
- Day 132 since course start (13 Apr 2026); 61 days to course end (23 Oct 2026).
- No payments linked in SIS. Booking last updated 2026-06-23 (2 months ago).
- Data unchanged since 60th check (Fri 21 Aug).

Fix NOT YET RUN:
1. Verify payment in HubSpot deal / Xero for EUR 1,509 from Ariunsarnai Batbayar.
2. If confirmed externally: set booking 1605 confirmed=true, update amountPaid and amountOpen, create SCA on BC 1791.
3. If not paid: escalate contact -- 132 days overdue, 61 days remaining in course.

Risk: money/bookings -- do NOT update payment fields without external confirmation. Blast radius: 1 student, 1 booking, 1 BC.
Status: Open -- day 132. Fix NOT RUN.
Last checked: 2026-08-23 UTC (470th run)
