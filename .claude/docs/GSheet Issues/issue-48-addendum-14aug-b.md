# Issue 48 - Telmuun Enkhsaikhan + class assignment gap (addendum 14 Aug 2026-b)
Reporter: various | Area: Attendance / classes | Sheet row: 50
120th check Fri 14 Aug 2026 UTC

Symptom:
ILEP students not found for class assignment; Telmuun has Booking Course 1810 with 0 class assignments 46 days in; Payment 17956 not in Xero; Booking 1624 EUR 250 outstanding.

Root cause (verified):
- Booking Course 1810 (Academic Year Renewal Morning, Telmuun Enkhsaikhan): 29 Jun to 1 Jan 2027, active = true, 0 class assignments - 46 days active without SCA
- Payment 17956: EUR 100, Bank, booking_id = 1624, xero_payment_id = null, created 2026-06-29 - 46 days unreconciled
- Booking 1624 (Telmuun Enkhsaikhan): status = PARTIAL, confirmed = false, amount_paid = EUR 1,406, amount_open = EUR 250; last updated 2026-08-05
- Hash change this run: edit to B column on sheet (more students listed); Telmuun/BC 1810 data unchanged

Fix recipe (NOT YET RUN):
Step 1 - Assign Booking Course 1810 to the correct morning class (confirm class with Paul/admin):
  INSERT INTO student_class_assignments (class_id, booking_course_id, week_start, week_end, created_at, updated_at)
  VALUES (<class_id>, 1810, '2026-06-29', '2027-01-01', NOW(), NOW());
  (Use actual first week of attendance for week_start if different from BC start.)

Step 2 - Reconcile Payment 17956 (EUR 100, Bank, 29 Jun 2026) in Xero:
  Find EUR 100 Bank receipt from Telmuun around 29 Jun 2026 in Xero.
  Then: UPDATE payments SET xero_payment_id = '<xero-id>', updated_at = NOW() WHERE id = 17956;

Step 3 - Settle EUR 250 balance and confirm booking (only once EUR 250 actually received):
  UPDATE bookings SET amount_paid = 1656, amount_open = 0, confirmed = true, status = 'CONFIRMED', updated_at = NOW()
  WHERE id = 1624;

Risk: bookings + financial + attendance. Reversible. Blast: 1 student, 1 booking, 1 payment, 1 BC.
Status: Open - BC 1810: 0 SCAs 46d; Payment 17956 Xero null 46d. Fix NOT RUN.
Last checked: Fri 14 Aug 2026 UTC (120th check)
