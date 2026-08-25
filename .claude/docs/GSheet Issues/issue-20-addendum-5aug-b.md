# Issue 20 — Ariunsarnai Batbayar Payment Due (24th check)

Reporter: PG | Area: Booking / Class | Sheet row 21 | Last checked: 2026-08-05 UTC

## Symptom
Student not appearing in "to be assigned" — shows payment due.

## Root cause — unchanged (day 116 since course start Apr 13 2026)

Booking 1605 (Ariunsarnai Batbayar, student 1047):
  Status = PENDING, confirmed = false
  Amount paid = EUR 0, amount open = EUR 1,509
  0 payments on record

Booking course 1791: 0 class assignments

Deal ID: 1605 (HubSpot) — payment collection may have stalled

## Fix recipe (NOT YET RUN)

Step 1 — Check HubSpot deal 1605 for payment status and any notes from sales team.

Step 2 — If payment has been received outside SIS (wire transfer etc.), record it:
  SIS admin > Payments > Add payment for booking 1605 (EUR 1,509)
  Then confirm booking: UPDATE bookings SET confirmed = true, status = CONFIRMED WHERE id = 1605;

Step 3 — Once booking confirmed, assign class for booking course 1791.

Step 4 — If student has left / deal is void, mark booking cancelled.

Risk: money | Reversible | Blast radius: low (one student, 116 days outstanding)
Status: OPEN — 24th check 2026-08-05 UTC. EUR 1,509 outstanding. NOT YET RUN.