Issue 25 - Uyanga Tungalag: Visa Null + 0 SCAs (144th check Tue 4 Aug 2026 UTC)
Reporter: | Area: Booking | Sheet row: 26

Root Cause (fresh 2026-08-04 UTC)
- Student 917 (Uyanga Tungalag): visa_status=null, hubspot_contact_id=null. Confirmed fresh.
- BC 1613 (Academic Year Morning, 2026-04-27 to 2026-10-30): active=true, 0 SCAs.
  Day 100 since course start with 0 class assignments.
- Booking: amount_paid=EUR 2405 = amount_total=EUR 2405 (fully paid, no discrepancy in booking record).
  Previously flagged EUR 661 discrepancy not visible in booking record -- may be reconciled or payment-level.
All unchanged.

Fix Recipe (NOT YET RUN)
Step 1: Search HubSpot for Uyanga Tungalag; UPDATE students SET hubspot_contact_id=<id> WHERE id=917;
Step 2: UPDATE students SET visa_status=<type> WHERE id=917;
Step 3: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (1613,917,<class_id>,2026-04-27,2026-10-30);
Step 4: Verify payments total: SELECT SUM(amount) FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE student_id=917);

Risk: data-hygiene, bookings | Reversible: yes | student 917 only.

Status: NOT YET RUN | Last checked: 2026-08-04 UTC (144th check)