Issue 25 -- Uyanga Tungalag -- Visa Status Null / Not in Class (127th check, 29 Jul 2026)

Reporter: (unknown) | Area: Visa / Class | Sheet row: 26

Symptom
=======
Visa status not selected; cannot set to approved. Student not in class-to-be-assigned.

Root cause (DB, 29 Jul 2026 UTC -- 127th hourly check)
=======================================================
- Student 917 (Uyanga Tungalag): visaStatus = null. Last updated 2026-07-28 (bulk touch only -- still null).
- hubspotContactId = null on student record -- HubSpot link is missing.
- Booking course 1613 (Academic Year Morning, Apr 27-Oct 30 2026): active = true.
- Zero class assignments on booking course 1613 -- 93+ days into course with no class. UNCHANGED.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Find HubSpot contact for Uyanga Tungalag
NOT YET RUN:
  Search HubSpot contacts for Uyanga Tungalag.
  Or find the HubSpot deal linked to student 917 and follow the contact.

Step 2 -- Link HubSpot contact ID to student 917
NOT YET RUN:
  UPDATE students SET hubspot_contact_id = <id>, updated_at = NOW() WHERE id = 917;

Step 3 -- Set visa status in SIS admin
NOT YET RUN:
  Student profile 917 -> Visa Status -> set to appropriate value.
  Or via DB:
  UPDATE students SET visa_status = 'APPROVED', updated_at = NOW() WHERE id = 917;

Step 4 -- Assign student to class for booking course 1613
NOT YET RUN:
  SIS admin -> Class Assignment -> assign student 917 to an Academic Year Morning class.
  Start from current week.

Risk / category
===============
Data -- low blast radius; reversible.
Student has been unassigned for 93+ days into a 187-day Academic Year course.

Status
======
OPEN -- Fix NOT RUN. 127th check 29 Jul 2026 UTC.
visaStatus = null. hubspotContactId = null. Booking course 1613 zero assignments. Day 93+.

Last checked
============
2026-07-29 UTC