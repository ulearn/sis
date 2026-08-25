# Issue 24 -- Alberto Squillace (addendum 2 Aug c)

Reporter: AC  Area: Booking  Sheet row: 25  Student ID in booking 1611

## Symptom
Migration issue -- student had bereavement holidays in Fidelo; SIS shows gap.
Student resumes Tue 4 Aug (after Aug Bank Holiday). No SCA exists on current BC.

## Root cause (26th check Sun 2 Aug 2026 UTC)

- BC 1797 (Morning General, Apr 6 - Jun 26 2026): active=true -- 37 days stale. Should be deactivated.
- BC 24686 (Morning General, Jul 20 - Sep 18 2026): active=true, fee=null, 0 class assignments.
  Last SCA was on BC 1797, class 12, week Apr 6-26 (99 days ago -- bereavement leave).
- BK 1611: CONFIRMED, confirmed=true, amtPaid=1280.12, amtOpen=0.
- PMT 17124 (EUR 1,280.12): xeroPaymentId=null -- not in Xero.

## Fix recipe (NOT YET RUN)

Step 1 -- Set fee on BC 24686:
  Check HubSpot deal or original booking for the course fee amount.
  UPDATE booking_courses SET fee = <amount> WHERE id = 24686;

Step 2 -- Create SCA on BC 24686:
  In SIS admin: Booking 1611 -> Course 24686 -> Class Assignments -> Add
  Class: 12 (same as previous, confirm current level)
  Week start: 2026-08-04, Week end: 2026-09-18

Step 3 -- Deactivate BC 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 4 (optional) -- Reconcile PMT 17124 in Xero.

## Risk
Category: bookings. Reversible: yes. SCA is urgent (student starts Tue Aug 4).

## Status
OPEN. Fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC (26th check)