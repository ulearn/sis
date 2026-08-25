# Issue 20 — Ariunsarnai Batbayar: PENDING booking EUR 1,509, 124 days unassigned (53rd check, 15 Aug 2026)

Reporter: staff | Area: Booking / Class | Sheet row: 21

## Symptom
Student not appearing in class-to-be-assigned list (shown as payment due). Course started Apr 13 (124 days ago) with no class assignment.

## Root cause (verified 15 Aug 2026 UTC)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false, amountPaid = EUR 0, amountOpen = EUR 1,509
- No payments linked to booking 1605 — last updated 2026-06-23 (53 days ago)
- Only 1 booking for student 1047 — no successor or alternative booking
- Booking Course 1791 (Academic Year Renewal Morning, 13 Apr to 23 Oct 2026): active = true, 0 class assignments
- Student has been attending (presumably) for 124 school days with no SCA recorded
- Likely Fidelo migration gap — payment made in Fidelo before SIS migration, not transferred

No change from 52nd check (Fri 14 Aug). Day 124 with no resolution.

## Fix recipe (NOT YET RUN)

Step 1 — Verify payment received outside SIS:
  Check Xero/bank for payment from Ariunsarnai Batbayar or their agency (~EUR 1,509) around Apr 2026.
  Check Fidelo export for booking 1605 / student 1047 historical payment.

Step 2 — If payment confirmed: create payment record and confirm booking.
  SQL (example — fill actual values from Xero):
    INSERT INTO payments (booking_id, amount, method, payment_date, transaction_id, paid_by, data_source)
    VALUES (1605, 1509, 'Bank', '2026-04-01', '<Xero_ref>', 'Agency', 'Fidelo');
    UPDATE bookings SET confirmed = true, amount_paid = 1509, amount_open = 0 WHERE id = 1605;

Step 3 — Assign student to AM Morning class (confirm classId):
    INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
    VALUES (1791, <am_morning_class_id>, '2026-04-13', '2026-10-23');

Step 4 — If payment NOT found: chase before assigning.

## Risk / category
Bookings / money — EUR 1,509 unrecorded; 124d no class assignment. Compliance risk: attendance gap. Reversible.

## Status: OPEN — no change since 52nd check. Day 124. Requires Xero/Fidelo payment verification. Fix NOT RUN.
Last checked: 2026-08-15 UTC (53rd check)