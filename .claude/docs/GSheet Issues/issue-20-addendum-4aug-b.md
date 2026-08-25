# Issue 20 — Ariunsarnai Batbayar: Payment Pending Day 114 (22nd check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Attendance/classes | Sheet row: 21

## Root Cause (verified 2026-08-04 UTC, 22nd check — unchanged)
- Student: Ariunsarnai Batbayar (student 1047).
- Booking 1605: status = PENDING, confirmed = false.
- Amount total: EUR 1,509, amount paid: EUR 0, amount open: EUR 1,509.
- No payment records linked to booking 1605.
- Booking course 1791 (Academic Year Renewal Morning, 2026-04-13 to 2026-10-23): active = true, 0 class assignments.
- Day 114 since course start (2026-04-13). Student blocked from class assignment pending payment.

## Fix Recipe (NOT YET RUN)
Step 1 — Confirm with accounts: was payment received via external channel (bank transfer, cash)?
Step 2a — If paid externally:
  INSERT INTO payments (booking_id, amount, payment_date, ...) VALUES (1605, 1509, '<date>', ...);
  UPDATE bookings SET status = 'CONFIRMED', confirmed = true, amount_paid = 1509, amount_open = 0 WHERE id = 1605;
  Then create SCA for BC 1791 via SIS admin.
Step 2b — If not paid: chase student / agent or cancel booking and deactivate BC 1791.

## Risk: money, bookings | Reversible: careful | Blast radius: 1 student
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (22nd check) | Day 114 since Apr 13