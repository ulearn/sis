# Issue 20 — Ariunsarnai Batbayar: Unpaid PENDING booking, day 110

Reporter: AC  Area: Booking / Class  Sheet row: 21

## Symptom
Booking 1605 is PENDING + confirmed=false, EUR 0 paid of EUR 1,509. Course started 13 Apr 2026 (day 110).

## Root cause (confirmed 2026-08-01 UTC)
- Booking 1605 (student 1047 Ariunsarnai Batbayar): status = PENDING, confirmed = false, amountPaid = 0, amountOpen = 1509.
- Last booking update: 2026-06-23 — 39 days without activity.
- Booking course 1791 (Academic Year Renewal Morning, 13 Apr – 23 Oct 2026): active = true, 0 class assignments.
- No payments recorded on booking 1605.

## Fix recipe (NOT YET RUN)

Step 1 — Check if payments exist in HubSpot / Hub (NOT YET RUN):
  ssh hub@localhost: check fins/ for any payment against student 1047 or booking 1605.

Step 2 — If student has paid, confirm booking (NOT YET RUN):
  UPDATE booking SET status = "CONFIRMED", confirmed = true WHERE id = 1605;

Step 3 — If genuinely unpaid and not attending, cancel (NOT YET RUN):
  UPDATE booking SET status = "CANCELLED", confirmed = false WHERE id = 1605;
  UPDATE booking_course SET active = false WHERE id = 1791;

Step 4 — If confirmed, assign to class (NOT YET RUN):
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES (1791, 1047, <classId>, <weekStart>, <weekEnd>, NOW());

Step 5 — Verify:
  SELECT id, status, confirmed, amount_paid, amount_open FROM booking WHERE id = 1605;
  SELECT id, active FROM booking_course WHERE id = 1791;

## Risk
Category: bookings / payments. Reversible: yes. Blast radius: 1 student.

## Status: OPEN — day 110, EUR 0 paid
Last checked: 2026-08-01 UTC (2nd check of day)
