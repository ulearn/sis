# Issue 7 — Sofiia Korkishchenko: Cancelled Booking 17909 anomaly (43rd check, 15 Aug 2026)

Reporter: staff | Area: Booking | Sheet row: 8

## Symptom
Booking 17909 shows CANCELLED but confirmed=true and an active Booking Course remain.

## Root cause (verified 15 Aug 2026 UTC)
- Booking 17909 (student 768): status = CANCELLED, confirmed = true (anomaly)
- Amount paid = EUR 0, amount open = EUR 727.50, no payment records linked
- Last updated 2026-06-17 — 59 days with no admin action
- Booking Course 24693 (Renewal - Academic Year PM, ends 13 Nov 2026): active = true on cancelled booking, 0 class assignments
- Student correctly enrolled via booking 17849 / Booking Course 24623 — no student impact
- Same booking tracked under Issue 27 (row 28) — identical fix applies to both rows

No change from 42nd check (Fri 14 Aug). Anomaly persists 59 days.

## Fix recipe (NOT YET RUN)

Step 1 — Clear confirmed flag on cancelled booking:
  SQL: UPDATE bookings SET confirmed = false WHERE id = 17909;

Step 2 — Deactivate orphaned Booking Course:
  SQL: UPDATE booking_courses SET active = false WHERE id = 24693;

Step 3 — Verify Booking Course 24623 (active booking 17849) is correctly active with class assignments.

## Risk / category
Data-hygiene; reversible. Blast radius: 1 student (Sofiia Korkishchenko). No financial impact.

## Status: OPEN — no change since 42nd check. Fix NOT RUN.
Last checked: 2026-08-15 UTC (43rd check)