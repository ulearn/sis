# Issue 7 — Sofiia Korkishchenko Booking Anomaly (27th check)

Reporter: AC | Area: Booking | Sheet row 8 | Last checked: 2026-08-05 UTC

## Symptom
Student not appearing on arrivals list despite booking existing. Two bookings in profile.

## Root cause — unchanged (53 days open)

Booking 17909 (Sofiia Korkishchenko, student 768):
  Status = CANCELLED, confirmed = true (anomaly — confirmed should be false for cancelled)
  Amount paid = EUR 0, amount open = EUR 727.50 — full balance unpaid

Booking course 24693 (Renewal Academic Year PM, ends 2026-11-13):
  Active = true, 0 class assignments
  This course should not be active if the booking is cancelled

## Fix recipe (NOT YET RUN)

Step 1 — Confirm intent with staff: is booking 17909 genuinely cancelled?
  If YES (cancel confirmed): proceed to Step 2.
  If NO (student should be reinstated): change status to CONFIRMED and collect EUR 727.50.

Step 2 (if cancellation confirmed) — Fix the booking anomalies:
  UPDATE bookings SET confirmed = false WHERE id = 17909;
  UPDATE booking_courses SET active = false WHERE id = 24693;

Step 3 — Verify no documents (visa letters, LOAs) exist on booking 17909 that may need
revocation before closing.

Risk: bookings | Reversible | Blast radius: low (one student)
Status: OPEN — 27th check 2026-08-05 UTC. No change since reported. NOT YET RUN.