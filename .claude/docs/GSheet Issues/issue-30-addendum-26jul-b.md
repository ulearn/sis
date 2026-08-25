# Issue 30 — Giulia Avallone / Milena Vinci — BC104 Stale + Xero Null

Reporter: Various | Area: Booking | Sheet row: 31

## Root cause (verified Sun 26 Jul 2026 UTC — run 107)
- BC 104 (Morning General Plus, booking 94): endDate = Jun 26 2026, active = still true — 31 days stale
- Payment 17102 (EUR 1,151.50, booking 94, Giulia Avallone): xeroPaymentId = null — 136 days (Mar 13 2026)
- UNCHANGED from prior checks

## Fix recipe (NOT YET RUN)

Step 1: UPDATE booking_course SET active = false WHERE id = 104;

Step 2: Reconcile payment 17102 in Xero (EUR 1,151.50, Mar 13 2026, booking 94 / Giulia Avallone).

## Risk
Data hygiene. BC104 stale = cosmetic. Xero null = EUR 1,151.50 unreconciled. Reversible.

## Status
UNRESOLVED — BC104 stale 31d. Payment 17102 xero null 136d. Fix NOT RUN.

Last checked: Sun 26 Jul 2026 UTC (run 107)