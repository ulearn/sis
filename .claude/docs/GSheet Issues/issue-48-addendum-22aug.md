# Issue 48 — Telmuun Enkhsaikhan Payment Gap + No SCA (22nd check, 22 Aug 2026)

**Sheet row:** 50

## Root cause
- Booking 1624 (Telmuun Enkhsaikhan, student 293): PARTIAL, confirmed = false.
  amountPaid = EUR 1,406 | amountTotal = EUR 1,656 | amountOpen = EUR 250
  Only 1 payment: Payment 17956, EUR 100, method Bank, 31 Mar 2026, xeroPaymentId = null.
  EUR 1,306 discrepancy (amountPaid 1,406 vs 1 payment EUR 100). Last updated 5 Aug 2026.
- BC 1810 (Academic Year Renewal Morning, booking 1624): Jun 29 2026 to Jan 1 2027, active, 0 class assignments (54d since start).

## Fix recipe (NOT YET RUN)
- Investigate EUR 1,306 gap: check Xero/TransferMate for payments on booking 1624 / student 293.
- If missing payment confirmed: INSERT INTO payment (booking_id, amount, method, payment_date) VALUES (1624, 1306.00, Bank, date);
- Reconcile Payment 17956 in Xero: UPDATE payment SET xero_payment_id = id WHERE id = 17956;
- Add SCA for BC 1810 (class TBD): INSERT INTO student_class_assignment (booking_course_id, class_id, week_end) VALUES (1810, class, 2026-08-28);
- Set confirmed = true: UPDATE booking SET confirmed = true WHERE id = 1624;

## Risk
Money/bookings. Reversible. Single booking 1624.

**Last checked:** Sat 22 Aug 2026 UTC (22nd check)