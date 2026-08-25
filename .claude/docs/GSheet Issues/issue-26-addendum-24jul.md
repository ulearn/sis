# Issue 26 — Ivan Rodriguez / Ernesto Pesoa — Stale BCs + EUR 250 Outstanding
Reporter: NM | Area: Booking / Class | Sheet row: 27

## Root Cause (Fri 24 Jul 2026 UTC — 39th check, 25th hourly — UNCHANGED)
- Booking course 23 (Ivan Rodriguez Solares, Intensive General 30, ended 22 May 2026): active=true — 63 days stale
- Booking course 24826 (Ernesto Pesoa Gil, Intensive General 30, ended 19 Jun 2026): active=true — 35 days stale
- Booking 18034 (Ernesto Pesoa Gil): PARTIAL, confirmed=false, EUR 845/1095, EUR 250 outstanding
- Payment 17683 (EUR 845, booking 18034): type=null, xeroPaymentId=null — unreconciled

## Fix (NOT YET RUN)
1. UPDATE BookingCourse SET active=false, updatedAt=NOW() WHERE id IN (23, 24826)
2. Chase EUR 250 from Ernesto Pesoa / agency for booking 18034
3. UPDATE Payment SET type=one_time_or_initial, xeroPaymentId=<xero_id>, updatedAt=NOW() WHERE id=17683

## Risk: EUR 250 outstanding + Xero null — MEDIUM. Stale BCs cosmetic. Reversible.
## Status: UNCHANGED — BC23 63d, BC24826 35d, EUR250 open. Fix NOT RUN. Fri 24 Jul 2026 UTC
