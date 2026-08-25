# Issue 9 -- Document 171 DRAFT unissued, Booking 1498 anomaly (68th check)

Reporter: NM | Area: Doc Gen/Certs | Sheet row: 10 | Last checked: 2026-08-17 UTC

## Symptom
Certificate shows dates from previous course for Suvderdene Bayartsog.

## Root cause (no change)
- Document 171 (booking 1498, template 82): status = DRAFT, version 1, created 2026-06-05 -- 73 days unissued
- Booking 1498 (Suvderdene Bayartsog): CONFIRMED, confirmed = false (anomaly), amount_paid = null
- Booking Course 1660 (ULearn Renewal MORN): ended 2026-06-05 -- 73 days stale, active = true

## Fix recipe (NOT YET RUN)
1. Verify payment status for Booking 1498 (amount_paid null -- check if payment exists in payments table).
   SELECT * FROM payments WHERE booking_id = 1498;
2. If paid, set confirmed = true: UPDATE bookings SET confirmed = true WHERE id = 1498;
3. Issue or delete Document 171 via SIS admin (booking 1498 doc generation UI).
4. Deactivate BC 1660: UPDATE booking_courses SET active = false WHERE id = 1660;

## Risk
Documents: medium. Booking confirmed flag: low. Reversible.

## Status
73 days unissued. Fix pending Neil approval.
Last checked: 2026-08-17 UTC (68th check)