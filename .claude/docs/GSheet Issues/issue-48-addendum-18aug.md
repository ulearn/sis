# Issue 48 — Telmuun Enkhsaikhan + group (Student 293)

**Reporter:** AC | **Area:** Attendance / classes | **Sheet row:** 50
**Last checked:** 2026-08-18 UTC (146th check)

## Root cause (evidence from live DB)

- Booking 1624 (Telmuun Enkhsaikhan, student 293): status = PARTIAL, confirmed = false
- amountPaid = EUR 1,406; amountOpen = EUR 250; implied total EUR 1,656
- Only 1 payment record: ID 17956, EUR 100, 31 Mar 2026, xeroPaymentId = null
- EUR 1,306 missing from payment records — booking shows EUR 1,406 paid but only EUR 100 linked
- BC 1810 (Academic Year Renewal Morning): 29 Jun 2026 to 1 Jan 2027, active = true, 0 SCAs (50 days no class)

## Fix recipe (NOT YET RUN)

### Step 1 — Investigate EUR 1,306 payment gap
SELECT id, amount, payment_date, xero_payment_id, transaction_id, data_source FROM payments WHERE booking_id = 1624;
SELECT p.id, p.amount, p.payment_date FROM payments p
JOIN bookings b ON b.id = p.booking_id WHERE b.student_id = 293;
Also check HubSpot deal + TransferMate records via Hub fins/ for this student.

### Step 2 — Assign class to BC 1810
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at)
VALUES (1810, 293, <class_id>, '<start_date>', '2027-01-01', NOW());

### Step 3 — Settle EUR 250 open balance
INSERT INTO payments (booking_id, amount, payment_date, created_at) VALUES (1624, 250, '<date>', NOW());

### Step 4 — Confirm booking
UPDATE bookings SET confirmed = true WHERE id = 1624;

## Risk / category
- money + bookings | payment gap may be migration artefact | reversible | blast radius: 1 student
- Urgency: medium — student not appearing in class; EUR 1,306 gap needs source investigation first

## Status
Open — EUR 1,306 gap unresolved, BC 1810 has 0 SCAs at 50 days, EUR 250 outstanding. Fix not run.
**Last checked:** 2026-08-18 UTC