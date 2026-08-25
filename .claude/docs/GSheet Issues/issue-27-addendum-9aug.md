# Issue 27 — Sofiia Korkishchenko (BK17909 CANCELLED + confirmed anomaly)

Reporter: KC | Area: Booking | Sheet row 28 | 44th check Sun 9 Aug 2026 UTC

## Symptom
Booking 17909 is CANCELLED but confirmed = true, amountOpen = EUR 727.50, no payments.

## Root cause
- Booking 17909 (Sofiia Korkishchenko, student 768): status = CANCELLED, confirmed = true (anomaly)
- amountPaid = EUR 0, amountOpen = EUR 727.50 — no payment records back this open amount
- Last updated: 2026-06-17 (53 days ago)
- BC 24693 (Renewal - Academic Year PM, 2026-05-25 to 2026-11-13, bookingId = 17909): active = true on cancelled booking
- Student correctly enrolled on Booking 17849 / BC 24623 — no student impact
- Also tracked under Issue 7 (row 8). No change since Sat 8 Aug.

## Fix recipe (NOT YET RUN)
```sql
UPDATE "Booking" SET confirmed = false WHERE id = 17909;
UPDATE "BookingCourse" SET active = false WHERE id = 24693;
SELECT id, status, confirmed, amount_paid, amount_open FROM "Booking" WHERE id = 17909;
SELECT id, name, active FROM "BookingCourse" WHERE id = 24693;
```
Note: EUR 727.50 open with no payments is a data anomaly — verify with accounts before zeroing amount_open.

## Risk
Category: bookings/data-hygiene | Reversible: yes | Blast radius: BK17909 + BC24693

## Status
Pending — unchanged 53 days. Fix NOT RUN.
Last checked: Sun 9 Aug 2026 UTC