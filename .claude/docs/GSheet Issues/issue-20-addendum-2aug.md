Issue 20 Ariunsarnai Batbayar Payment Due
Reporter: PG Row 21 Check 11th (2nd today Sun 2 Aug UTC)

Root Cause (11th check 02 Aug 2026):
- BK 1605 (student 1047): status=PENDING confirmed=false.
- amountPaid=EUR 0 amountOpen=EUR 1509 zero payment records on file.
- BC 1791 (Academic Year Renewal Morning Apr 13-Oct 23 2026): active=true 0 class assignments.
- Day 112 since Apr 13 start. Last updated Jun 23 2026 (40 days ago).

Fix Recipe (NOT YET RUN):
1. Chase EUR 1509 outstanding on BK 1605 from agent/student.
2. Once received record: INSERT INTO payments (booking_id, amount, method, payment_date, data_source) VALUES (1605, 1509, <method>, <date>, MANUAL);
3. Confirm: UPDATE bookings SET confirmed=true, amount_open=0 WHERE id=1605;
4. Create SCA for BC 1791: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start) VALUES (1791, <class_id>, <week>);
5. If no-show: cancel BK 1605 and deactivate BC 1791.

Risk: Money + bookings. Reversible. 1 student. 112 days overdue, escalate or cancel.

Status: UNRESOLVED Fix NOT RUN
Last checked: 2026-08-02 UTC