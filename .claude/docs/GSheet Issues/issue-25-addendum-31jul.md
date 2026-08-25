Issue 25 Addendum - Fri 31 Jul 2026 (132nd check)
Reporter: PG | Area: Visa/Class | Sheet row: 26
Student: Uyanga Tungalag, student 917, booking 1467

STATUS: UNCHANGED - VISA NULL, HUBSPOT UNLINKED, ZERO SCAs, DAY 95

Evidence (live DB, 132nd check Fri 31 Jul 2026 UTC)

Student 917 (Uyanga Tungalag): visaStatus = null | hubspotContactId = null
Booking 1467: CONFIRMED, confirmed = true | EUR 2,405 / 2,405 (fully paid)
BC 1613 (Academic Year Morning, 27 Apr - 30 Oct 2026): active | fee EUR 3,370 | day 95 | 0 SCAs ever
Unreconciled: EUR 661 overpayment (see issue-25-uyanga-visa-escrow.md).

Fix Recipe (NOT YET RUN)

Step 1 - Set visa status:
  UPDATE students SET visa_status = 'Approved' WHERE id = 917;

Step 2 - Link HubSpot contact (find contact ID from HubSpot deal 1467):
  UPDATE students SET hubspot_contact_id = '[hs_contact_id]' WHERE id = 917;

Step 3 - Create SCA for BC 1613:
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (1613, 917, [class_id], '2026-08-04', [course_end_or_term_end]);

Step 4 - Reconcile EUR 661 overpayment: see issue-25-uyanga-visa-escrow.md.

Risk: bookings, visa, data-hygiene | Reversible: Yes
Blast radius: 1 student update, 1 SCA insert, 1 Xero reconciliation

Status: Fix NOT RUN. 132nd check Fri 31 Jul 2026 UTC. Day 95; 0 SCAs.
