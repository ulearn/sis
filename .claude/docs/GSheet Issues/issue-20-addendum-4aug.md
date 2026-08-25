# Issue 20 — Ariunsarnai Batbayar Payment Pending (21st check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Attendance/classes | Sheet row: 21

## Root Cause (verified 2026-08-04 UTC, 21st check — unchanged)
- Student: Ariunsarnai Batbayar (student 1047).
- Booking 1605: status = PENDING, confirmed = false.
- Amount total: EUR 1,509, amount paid: EUR 0, amount open: EUR 1,509.
- No payment records linked to booking 1605.
- Booking course 1791 (Academic Year Renewal Morning, 2026-04-13 to 2026-10-23): active = true, 0 class assignments.
- Day 114 since course start (2026-04-13). Student blocked from class assignment.

## Fix Recipe (NOT YET RUN)
Step 1 — Confirm with accounts: was payment received via external channel?
Step 2a — If paid: link payment, set booking 1605 status = CONFIRMED, confirmed = true, create SCA on BC 1791.
Step 2b — If not paid: chase or cancel; deactivate BC 1791.

## Risk: money, bookings | Reversible: careful | Blast radius: 1 student
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (21st check) | Day 114 since Apr 13