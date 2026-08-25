# Issue 7 - Sofiia Korkishchenko Booking Anomalies (28th check)

Reporter: AC | Area: Booking | Sheet row 8 | Last checked: 2026-08-05 UTC (28th check)

State - verified 28th check Wed 5 Aug 2026 UTC
No change from 27th check. Open 54 days.

Booking 17909 (Sofiia Korkishchenko, student 768):
- Status: CANCELLED
- confirmed = true (anomaly)
- amount_paid = EUR 0
- amount_open = EUR 727.50
- 0 payment records linked
- 0 class assignments

Booking course 24693 (Renewal - Academic Year PM):
- booking_id = 17909
- active = true (anomaly - should be inactive for a cancelled booking)
- endDate = 2026-11-13
- 0 class assignments

Root Cause:
Booking 17909 was cancelled but confirmed was not cleared and booking course 24693 was not deactivated.
Student never started; nothing was paid.

Fix Recipe (NOT YET RUN):

Step 1 - Confirm intent with staff: definitively cancelled, no reinstatement expected?

Step 2 - Clear confirmed flag:
  UPDATE bookings SET confirmed = false WHERE id = 17909;

Step 3 - Deactivate orphaned booking course:
  UPDATE booking_courses SET active = false WHERE id = 24693;

No payment reversal needed (EUR 0 paid). No class assignment cleanup needed (0 class assignments).

Risk: bookings / data-hygiene | Reversible | Blast radius: 1 student, zero financial impact.
Status: OPEN - 28th check 2026-08-05 UTC. NOT YET RUN. 54 days open.