# Issue 20 — Ariunsarnai Batbayar EUR 1,509 Unpaid (day 116)
Reporter: AC | Area: Booking / Class | Sheet row: 21

## Root Cause (verified 16:02 UTC Thu 6 Aug 2026)
- Booking 1605 (student, course started 13 Apr 2026): status=PENDING, confirmed=false.
- amount_total=EUR 1,509, amount_paid=EUR 0, amount_open=EUR 1,509.
- 0 payment records linked to booking 1605.
- service_start=2026-04-13, service_end=2026-10-23.
- Last updated 2026-06-23 — 44 days ago.
- Day 116 since course start (13 Apr to 6 Aug = 115 days).

## Fix Recipe (NOT YET RUN)
Check HubSpot deal for this student — has any payment been made?
If payment confirmed: link payment record, set confirmed=true.
If no payment: contact agent/student re outstanding EUR 1,509.
See prior recipe: issue-20-addendum-6aug-c.md

## Status
Fix NOT RUN. EUR 1,509 unpaid, day 116. Last checked: 16:02 UTC Thu 6 Aug 2026