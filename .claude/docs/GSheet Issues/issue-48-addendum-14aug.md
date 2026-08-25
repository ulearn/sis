Issue 48 - Telmuun Enkhsaikhan + class assignment gap (addendum 14 Aug 2026)
Sheet row: 50 | Reporter: various | Area: Attendance / classes

Symptom
ILEP students cannot be found for class assignment; Telmuun has Booking Course 1810 with 0 SCAs 46 days in; Payment 17956 Xero null; Booking 1624 EUR 250 outstanding.

Root cause (live data - Fri 14 Aug 2026 UTC, 117th check - no change)
- Booking Course 1810 (Academic Year Renewal Morning, Telmuun Enkhsaikhan): 29 Jun 2026 to 1 Jan 2027, active = true, 0 class assignments - 46 days active without SCA
- Payment 17956: EUR 100, Bank, booking_id = 1624, xeroPaymentId = null, created 2026-06-29 - 46 days unreconciled
- Booking 1624 (Telmuun Enkhsaikhan): status = PARTIAL, confirmed = false, amount paid = EUR 1,406, amount open = EUR 250

Fix recipe (NOT YET RUN)

Step 1 - Assign Booking Course 1810 to morning class:
  Identify the AM class Telmuun attends (check with admin/Paul).
  INSERT INTO StudentClassAssignment (class_id, booking_course_id, week_start, week_end, created_at, updated_at)
  VALUES (<class_id>, 1810, '2026-06-29', '2027-01-01', NOW(), NOW());
  Use actual first week of attendance for week_start/week_end if already attending.

Step 2 - Reconcile Payment 17956 in Xero:
  Find EUR 100 from Telmuun / Booking 1624 around 29 Jun 2026:
  UPDATE Payment SET xero_payment_id = <xero-id>, updated_at = NOW() WHERE id = 17956;

Step 3 - Settle EUR 250 balance and confirm booking once payment received:
  UPDATE Booking SET amount_paid = 1656, amount_open = 0, confirmed = true, status = CONFIRMED, updated_at = NOW() WHERE id = 1624;

Risk / category
Bookings + financial + attendance. Reversible. Blast radius: 1 student, 1 booking, 1 payment.

Status: open - fix NOT RUN
Last checked: Fri 14 Aug 2026 UTC (117th check)