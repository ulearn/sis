# Issue 36b -- Stale Booking Accommodations + Pietro Caccianiga (addendum Sat 25 Jul 2026 UTC, 90th hourly run)

Sheet row: 38 | Area: Booking / Accomm | Reporter: KC

Stale BA count (Sat 25 Jul 2026 UTC)
- Stale booking accommodations (active=true, endDate past, bedId not null): 43
- Unchanged from Fri 24 Jul baseline of 43
- Most recently updated: BA 11365 (BK 18184, bed 174, ended Jul 18), BA 11167 (BK 93, bed 168, ended Jul 4)

Pietro Caccianiga (student 14521, BK 17980) -- status update this run
Original complaint: system will not let staff change accommodation dates to Jun 28-Sep 13 (11 weeks).
Current BA 11311: startDate=Jun 28, endDate=Sep 13 2026, bedId=84, active=true.
These ARE the correct dates (Jun 28 + 11 weeks = Sep 13). Pietro date issue appears RESOLVED.
Pietro is NOT counted in the 43 stale BAs (endDate Sep 13 is in the future).
Pietro booking course 24772: General English AM, Jun 29 to Aug 21, active=true, fee=EUR 1386
Pietro payment 17733: EUR 5331, paymentDate Jun 2, hubspotPaymentId=1243718869210, transactionId=null (53 days)

Fix recipe -- bulk stale BAs (NOT YET RUN)

Preview first (NOT YET RUN):
  SELECT id, "bookingId", "bedId", "endDate"
  FROM "BookingAccommodation"
  WHERE active=true AND "endDate" < NOW() AND "bedId" IS NOT NULL
  ORDER BY "endDate" DESC;

Fix after preview (NOT YET RUN):
  UPDATE "BookingAccommodation" SET active=false
  WHERE active=true AND "endDate" < NOW() AND "bedId" IS NOT NULL;

Fix recipe -- Pietro payment 17733 (NOT YET RUN)
Reconcile payment 17733 (EUR 5331, Jun 2) via Hub fins/ or SIS payment UI -- transactionId=null 53 days.

Risk / category
Stale BAs: Medium. Category: data-hygiene. 43-row bulk update, reversible.
Pietro payment: Medium. Category: money. EUR 5331 Xero null 53 days.

Status
Stale BAs: 43 -- OPEN, unchanged. Pietro dates: LIKELY RESOLVED. Pietro Xero: null 53 days.

Last checked: Sat 25 Jul 2026 UTC (90th hourly run)