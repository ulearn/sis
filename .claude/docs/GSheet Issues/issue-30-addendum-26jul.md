# Issue 30 — Giulia Avallone — BC104 Stale + Payment 17102 Xero Null (135 Days)

Reporter: NM | Area: Booking / Data hygiene | Sheet row: 31

## Root cause (verified Sun 26 Jul 2026 UTC)
- BC104 (Morning General Plus, ended Jun 26 2026): active=still true — 30 days stale
- Payment 17102 (EUR 1151.50, bk94, Giulia Avallone): xeroPaymentId=null
  135 days unreconciled (payment date Mar 13 2026)

## Fix recipe (NOT YET RUN)
1. UPDATE booking_course SET active=false WHERE id=104
2. Locate payment 17102 in Xero (EUR 1151.50, Mar 13 2026, Giulia Avallone / bk94)
   UPDATE payment SET xeroPaymentId=<id> WHERE id=17102

## Risk
Money — EUR 1151.50 unreconciled 135 days (audit risk). BC stale 30d (data hygiene).

## Status
UNRESOLVED — Payment 17102 unreconciled 135 days. BC104 stale 30 days.

Last checked: Sun 26 Jul 2026 UTC (104th hourly run for issue 30)