# Issue 27 — Sofiia Korkishchenko: Cancelled booking confirmed=true anomaly

Reporter: AC  Area: Booking / Class  Sheet row: 28

## Symptom
Booking 17909 is CANCELLED but confirmed=true. Booking course 24693 is still active.

## Root cause (confirmed 2026-08-01 UTC)
- Booking 17909 (student 768 Sofiia Korkishchenko): status = CANCELLED but confirmed = true (anomaly).
- Last updated 2026-06-17 — 45 days stale.
- Amount open = EUR 727.50, amount paid = EUR 0 — no payments on this booking.
- Booking course 24693 (Renewal Academic Year PM, 25 May – 13 Nov 2026): active = true — should be deactivated.
- Confirmed flag was not cleared when booking was cancelled (data migration or manual error).

## Fix recipe (NOT YET RUN)

Step 1 — Confirm no active class assignments on BC 24693 (NOT YET RUN):
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 24693;

Step 2 — Clear confirmed flag (NOT YET RUN):
  UPDATE booking SET confirmed = false WHERE id = 17909 AND status = "CANCELLED";

Step 3 — Deactivate booking course 24693 (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id = 24693;

Step 4 — Verify:
  SELECT id, status, confirmed, amount_paid, amount_open FROM booking WHERE id = 17909;
  -- Expected: status=CANCELLED, confirmed=false
  SELECT id, active FROM booking_course WHERE id = 24693;
  -- Expected: active=false

## Risk
Category: bookings / data-hygiene. Reversible: yes. Blast radius: 1 student.

## Status: OPEN — 45 days stale, fix not run
Last checked: 2026-08-01 UTC
