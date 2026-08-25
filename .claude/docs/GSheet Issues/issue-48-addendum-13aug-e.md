Issue 48 - Telmuun Enkhsaikhan payment gap + 0 SCAs - 109th check Thu 13 Aug 2026 UTC

ROOT CAUSE:
- BC 1810 (Academic Year Renewal Morning, Jun 29 - Jan 1 2027): 0 SCAs, 45 calendar days without assignment
- Booking 1624: PARTIAL, confirmed=false, amountPaid=1406, amountOpen=250, updatedAt=2026-08-05
- Only 1 payment on bk1624: ID 17956 EUR 100 (Mar 31, Xero null). EUR 1306 gap.
- All pmts for student 293 (IDs 259/884/17956): xeroPaymentId=null

FIX RECIPE (NOT YET RUN):
1. Verify EUR 1306 payment in Xero/bank (Fidelo-era transfer for Telmuun)
2. If confirmed: INSERT INTO payment (booking_id, amount, method, payment_date, xero_payment_id, created_at, updated_at) VALUES (1624, 1306.00, Bank, ACTUAL_DATE, XERO_ID, NOW(), NOW());
3. Add SCA: INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (1810, CLASS_ID, 2026-06-29, 2027-01-01, NOW(), NOW());
4. Set confirmed=true after EUR 250 resolved: UPDATE booking SET confirmed=true, amount_open=0, updated_at=NOW() WHERE id=1624;
5. Reconcile pmts 259/884/17956 in Xero

RISK: money/bookings/data-hygiene | Reversible: yes | Blast: 1 student; EUR 1306 discrepancy
STATUS: OPEN. 109th check. 45d, 0 SCAs. Bk updated Aug 5. Fix NOT RUN.