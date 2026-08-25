# Issue 36b Stale BAs + Pietro Xero — Addendum 99th hrly Sat 25 Jul 2026

Sheet row: 38 | Area: Booking / Accomm | Reporter: KC

STATUS: UNCHANGED from 98th hourly.

Live data (99th hrly):
  Stale booking accommodations (active=true, bedId!=null, endDate<now): 43 — unchanged
  Most recent: BA 11265 (booking 1274, bed 157, ended Jul 19 2026)
               BA 11257 (booking 7, bed 168, ended Jul 18 2026)
               BA 11365 (booking 18184, bed 174, ended Jul 18 2026)
  Pietro BA 11311 (Jun 28-Sep 13 2026): still active, dates correct — NOT in stale count
  Pietro payment 17733: EUR 5,331, Bank, Jun 2, xeroPaymentId=null (53 days)

Fix recipe — bulk stale BAs (NOT YET RUN):
  Preview first:
    SELECT id, "bookingId", "bedId", "endDate"
    FROM "BookingAccommodation"
    WHERE active=true AND "endDate" < NOW() AND "bedId" IS NOT NULL
    ORDER BY "endDate" DESC;
  Fix:
    UPDATE "BookingAccommodation" SET active=false
    WHERE active=true AND "endDate" < NOW() AND "bedId" IS NOT NULL;

Fix recipe — Pietro payment 17733 (NOT YET RUN):
  Reconcile payment 17733 (EUR 5,331, Jun 2) via Hub fins/ or SIS payment UI.
  Set xeroPaymentId and transactionId.

Risk: Medium / data-hygiene. 43-row bulk update, reversible.
Pietro: Medium / money. EUR 5,331 Xero null 53 days.

STATUS: Fix NOT RUN. Stale BA count: 43 (unchanged). Pietro xeroId null: 53 days.
Last checked: Sat 25 Jul 2026 UTC (99th hourly)
