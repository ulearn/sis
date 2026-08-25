# Issue 26 -- Ivan Rodriguez / Student 14532 | Row 27 | 421st run

Reporter: staff | Area: Booking / Class | Sheet row: 27

## Symptom
Intensive students only appear once in the to-be-assigned list.

## Root Cause (Thu 20 Aug 2026, 421st run / 70th check)
- BC 23 (Intensive General 30): active, ended 22 May 2026 -- 90 days stale (booking 22, Ivan Rodriguez, student 18)
- BC 24826 (2wk Intensive General 30): active, ended 19 Jun 2026 -- 62 days stale (booking 18034, student 14532)
- Booking 18034: PARTIAL, confirmed = false, amount_paid = EUR 845, amount_open = EUR 250
- Payments on 18034: 1 payment (ID 17683, EUR 845, Bank, 1 Jun 2026) -- EUR 250 unaccounted
Day-count update: BC23 was 89d (Wed 19 Aug) -> 90d; BC24826 was 61d -> 62d.

## Fix Recipe -- NOT YET RUN

Step 1 -- Deactivate stale Booking Courses:
  NOT YET RUN:
    UPDATE booking_courses SET active = false WHERE id IN (23, 24826);

Step 2 -- Investigate EUR 250 gap via Hub fins/:
  ssh hub@localhost -> fins/ -> look up booking 18034 / student 14532 payment history.
  If EUR 250 received: insert payment + update booking to CONFIRMED, confirmed = true, amount_open = 0.
  If not yet paid: chase student/agency.

## Risk
Data-hygiene (BC deactivate reversible) + Financial (EUR 250 -- verify before marking paid).

## Status
OPEN -- 70th check Thu 20 Aug. BC day counts updated. Fix NOT RUN.
Last checked: 2026-08-20 UTC (421st run)