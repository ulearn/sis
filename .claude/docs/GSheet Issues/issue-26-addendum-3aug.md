# Issue 26 — Ivan Rodriguez: Two stale booking courses + EUR 250 open (73d / 45d)

Reporter: (various)  Area: Booking / Class  Sheet row: 27

## Root cause (confirmed 2026-08-03 UTC)
- Booking course 23 (Intensive General 30, booking 22): ended 2026-05-22, active = true — 73 days stale.
- Booking course 24826 (2 weeks Intensive General 30, booking 18034): ended 2026-06-19, active = true — 45 days stale.
- Booking 18034 (student 14532): status = PARTIAL, confirmed = false, amount paid = EUR 845, amount open = EUR 250.
- Payment 17683 (EUR 845, bank, 2026-04-23): Xero payment ID = null — 102 days without Xero reconciliation.
- No change from 48th check (Sun 2 Aug).

## Fix recipe (NOT YET RUN)

Step 1 — Deactivate stale booking courses (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id IN (23, 24826);

Step 2 — Chase EUR 250 balance via HubSpot deal for booking 18034 (NOT YET RUN).

Step 3 — Reconcile payment 17683 in Xero — link Xero payment ID (NOT YET RUN).

Step 4 — Verify (NOT YET RUN):
  SELECT id, active FROM booking_course WHERE id IN (23, 24826);
  SELECT amount_open FROM booking WHERE id = 18034;
  SELECT xero_payment_id FROM payment WHERE id = 17683;

## Risk
Category: bookings / data-hygiene / money. Reversible: yes. Blast radius: 1 student, 2 booking courses.

## Status: OPEN — BC23 73d stale, BC24826 45d stale, EUR 250 open, pmt 17683 Xero null 102d
Last checked: 2026-08-03 UTC (49th hourly check)
