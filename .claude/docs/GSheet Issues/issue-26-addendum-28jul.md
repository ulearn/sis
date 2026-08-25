# Issue 26 — Ivan Rodriguez (stale BCs + EUR250 open) | Addendum 28 Jul 2026

Reporter: AC | Area: Booking | Sheet row: 27

## Symptom
Intensive students only appear once in class-to-be-assigned.

## Root Cause
Two stale active BCs plus outstanding EUR250 on second booking:
- BC 23: ended 22 May 2026, active=true — 67d stale (booking 22, EUR 1948/1948 fully paid)
- BC 24826: ended 19 Jun 2026, active=true — 39d stale (booking 18034)
- Booking 18034: PARTIAL, amountOpen=EUR250, amountPaid=EUR845, confirmed=false

Evidence (28 Jul 2026 UTC):
- BC 23: Intensive General 30, booking 22, active=true, ended May 22 (67d)
- BC 24826: 2 weeks Intensive General 30, booking 18034, active=true, ended Jun 19 (39d)
- Booking 22: CONFIRMED, EUR 0 open, EUR 1948 paid — fully settled
- Booking 18034: PARTIAL, EUR 250 open, EUR 845 paid, confirmed=false

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate stale BCs:
UPDATE BookingCourse SET active = false WHERE id IN (23, 24826);

Step 2 — Chase EUR 250 outstanding on booking 18034:
- Check HubSpot deal linked to booking 18034 for payment status
- If received: record payment, set amountOpen=0, confirmed=true
- If outstanding: flag to accounts

## Risk
Category: data-hygiene + money (EUR250). BC deactivation reversible. EUR250 chase: verify before writing off.

## Status
Unchanged — BC23 67d stale, BC24826 39d stale, EUR250 open. Fix NOT RUN.
Last checked: 28 Jul 2026 UTC