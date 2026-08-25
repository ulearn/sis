# Issue 30 - Giulia Avallone Stale Booking Course + Xero Null Payment (Addendum 21 Jul, run a)
Reporter: (various) | Area: Booking | Sheet row 31 | 37th hourly check (41st total) Tue 21 Jul 2026 UTC

## Symptom
Giulia Avallone mother Milena Vinci listed as student; Giulia stale booking course; payment not reconciled in Xero.

## Current Status (fresh DB)

BC 104 | Morning General Plus | ended 26 Jun 2026 | active=STILL true | 25 days stale
BC 1604 (Maurivan Kuhl, bk 1611 area -- separate student tracked in Issue 21) | Morning General | ended 3 Jul 2026 | active=STILL true | 18 days stale
Payment 17102 | booking 94 (Giulia Avallone, student 88) | EUR 1151.50 | type=null | xeroPaymentId=null | STILL unreconciled
Booking 94: CONFIRMED (details in main recipe)

## Fix Recipe (NOT YET RUN)
1. Deactivate BC 104: UPDATE booking_course SET active=false WHERE id=104;
   -- NOT YET RUN
2. Reconcile payment 17102 in Xero:
   - Log into Xero > find invoice for booking 94 (Giulia Avallone, student 88) > match payment EUR 1151.50
   - Payment type is null -- confirm type (likely bank transfer) before reconciling
   -- NOT YET RUN
3. Optionally deactivate BC 1604 (Maurivan Kuhl): UPDATE booking_course SET active=false WHERE id=1604;
   (Tracked separately in Issue 21, row 22)

## Risk / Category
- Category: bookings / money / data-hygiene
- Reversible: yes (set active=true again; Xero reconciliation reversible)
- Blast radius: cosmetic (BC stale); EUR 1151.50 unreconciled in Xero

## Status
OPEN - 37th hourly check, fix NOT YET RUN.
Last checked: 2026-07-21 ~21:00 UTC
