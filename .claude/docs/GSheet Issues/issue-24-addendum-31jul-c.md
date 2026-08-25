Issue 24 Addendum - Fri 31 Jul 2026 (5th check today)
Reporter: PG | Area: Booking | Sheet row: 25
Student: Alberto Squillace, student 1052, booking 1611

STATUS: UNCHANGED - BC 24686 FEE NULL, NO SCA FROM JUL 20, VISA NULL

Evidence (live DB, 5th check Fri 31 Jul 2026 UTC)

Student 1052 (Alberto Squillace): visaStatus = null (last touched 28 Jul 2026)
Booking 1611: CONFIRMED, confirmed = true | EUR 1,280.12 / 1,280.12 (fully paid)
BC 1797 (Morning General, 6 Apr - 26 Jun 2026): active = true (stale 35 days)
  Only SCA: ID 229, week 6 Apr - 26 Apr 2026 (partial)
BC 24686 (Morning General, 20 Jul - 18 Sep 2026): active | fee = null | 0 SCAs
  10 teaching days lost (Jul 20-31); ~34 remaining

Fix Recipe (NOT YET RUN)

Step 1 - Set visa status:
  UPDATE students SET visa_status = 'Approved' WHERE id = 1052;
  Confirm visa type with AC/PG if unsure.

Step 2 - Set fee on BC 24686:
  UPDATE booking_courses SET fee = [fee_amount] WHERE id = 24686;
  Get fee from booking deal or agent agreement.

Step 3 - Deactivate stale BC 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797 AND end_date < CURRENT_DATE;

Step 4 - Create SCA for BC 24686 (start 4 Aug 2026):
  Prior SCA 229 used class_id 12 - confirm still appropriate.
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24686, 1052, [class_id], '2026-08-04', '2026-09-18');

Step 5 - Verify:
  SELECT active FROM booking_courses WHERE id IN (1797, 24686);
  SELECT id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24686;

Risk: bookings, data-hygiene | Reversible: Yes
Blast radius: 1 BC deactivation, 1 BC fee update, 1 student update, 1 SCA insert

Status: Fix NOT RUN. 5th check today Fri 31 Jul 2026 UTC.
10 teaching days lost (Jul 20-31); ~34 remaining.
