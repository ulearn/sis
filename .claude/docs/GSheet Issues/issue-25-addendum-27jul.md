# Issue 25 — Uyanga Tungalag — Visa Null + No Class Assignments (Addendum 27 Jul 2026)
Reporter: ST | Area: Visa / Class | Sheet row: 26

Status (120th check, Mon 27 Jul 2026 UTC): UNCHANGED — 91 days into course, still 0 class assignments

Evidence:
- Student 917 (Uyanga Tungalag): visaStatus = null — 67 days since last update (21 May 2026)
- Student 917: hubspotContactId = null — cannot auto-verify visa from HubSpot
- Booking 1467: Confirmed, EUR 2,405 fully paid, confirmed = true
- Booking course 1613 (Academic Year Morning, 27 Apr–30 Oct 2026): active = true, 0 class assignments
- 91 days into course — all attendance since 27 Apr permanently irrecoverable
- Note: week of 3 Aug is Aug Bank Holiday (Issue 38); this does not affect the class assignment itself

Fix Recipe (NOT YET RUN):
Step 1 — Manually verify visa approval for Uyanga Tungalag from student file / email records.
Step 2 — Set visa status (NOT YET RUN):
  UPDATE Student SET visa_status = 'APPROVED', updated_at = NOW() WHERE id = 917;
Step 3 — Link HubSpot contact (NOT YET RUN):
  Search HubSpot for 'Uyanga Tungalag'; obtain contact ID.
  UPDATE Student SET hubspot_contact_id = <contact_id>, updated_at = NOW() WHERE id = 917;
Step 4 — Create class assignment from today (NOT YET RUN):
  INSERT INTO StudentClassAssignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at)
  VALUES (1613, <ay_morning_class_id>, '2026-07-27', '2026-10-30', NOW(), NOW());
  Note: 91 days of attendance (Apr 27–Jul 26) permanently lost. Assignment starts Jul 27 (this week).

Risk: Category bookings + class-assignment | Reversible yes | Blast radius: single student (attendance loss irrecoverable)
Status: OPEN. 120th check Mon 27 Jul 2026 UTC. Chronic 91 days unchanged. Fix NOT RUN.
