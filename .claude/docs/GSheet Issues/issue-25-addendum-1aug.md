ISSUE 25 — Uyanga Tungalag: visa null + zero SCAs + overpayment
===============================================================

Area: Visa/Class  Row: 26  Checked: 2026-08-01 UTC (133rd hrly, 3rd of day)

SYMPTOM
-------
Visa status not selectable; student not appearing in 'class to be assigned'. Day 96 without class assignment.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC, 3rd check)
------------------------------------------------------------
- Student 917 (Uyanga Tungalag): visaStatus = null | hubspotContactId = null.
- Booking 1467: CONFIRMED, confirmed = true | amountPaid = EUR 2,405 | amountOpen = EUR 0.
- Total payments received: EUR 3,066 (overpayment EUR 661 unreconciled).
- BC1613 (Academic Year Morning, Apr 27-Oct 30 2026): active=true, fee=EUR 3,370.
- 0 class assignments ever - day 96 from course start. UNCHANGED.

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 - Set visa status (NOT YET RUN):
  UPDATE students SET visa_status = 'Approved' WHERE id = 917;
  -- Verify: SELECT visa_status FROM students WHERE id = 917;

Step 2 - Link HubSpot contact (NOT YET RUN):
  -- Find HS contact ID from HubSpot deal associated with booking 1467
  UPDATE students SET hubspot_contact_id = '<HS_CONTACT_ID>' WHERE id = 917;

Step 3 - Create SCA for BC1613 (NOT YET RUN):
  -- Confirm current class with Paul
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES (1613, 917, <CLASS_ID>, '2026-08-04', '2026-10-30', NOW());
  -- week_start=2026-08-04 (after Aug BH), week_end=BC1613 end date

Step 4 - Reconcile EUR 661 overpayment:
  See issue-25-uyanga-visa-escrow.md for full reconciliation recipe.

Step 5 - Verify:
  SELECT visa_status, hubspot_contact_id FROM students WHERE id = 917;
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE student_id = 917;

RISK
----
Category: visa/bookings/class assignments/data-hygiene. Reversible: yes. Blast radius: 1 student.
URGENCY: 96 days without SCA. Attendance untracked the entire course.

STATUS: OPEN - Day 96; 0 SCAs; visa null. Fix NOT RUN.
Last checked: 2026-08-01 UTC (3rd check of day)
