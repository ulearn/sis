Issue 20 -- Ariunsarnai Batbayar -- Addendum 21 Jul 2026 (24th hrly)

Reporter: PG | Area: Booking / Class | Sheet row: 21

Root cause (38th check, Tue 21 Jul 2026 UTC):

Booking 1605 (Ariunsarnai Batbayar, student 1047):
  Status: PENDING -- Day 99 (started 13 Apr 2026)
  Amount paid: EUR 0 / EUR 1509 total
  Last updated: 23 Jun 2026 (28 days ago with no activity)
  HubSpot deal: 502951083215

Booking course 1791: active=true, started 13 Apr 2026, 0 class assignments ever.
Payments: 0 payments on file.
UNCHANGED from 23rd hourly check.

Fix recipe (NOT YET RUN):
Decision needed -- no payment in 99 days:
Option A (enrols): advance HubSpot deal 502951083215 to Won; process payment in SIS.
Option B (no longer enrolling): cancel booking 1605 (set status = CANCELLED).
Either way: set booking course 1791 active=false once booking is resolved.

Risk: bookings; reversible; blast radius one student.
Open -- Enrolment decision needed. Last checked: Tue 21 Jul 2026 UTC (24th hourly)
