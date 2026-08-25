Issue 22 -- Edith Nunes -- Visa Status Null / Not in Class (151st check, 29 Jul 2026)

Reporter: ST | Area: Booking / Class | Sheet row: 23

Symptom
=======
Student not appearing in class-to-be-assigned. Root cause confirmed: visaStatus = null.

Root cause (DB, 29 Jul 2026 UTC -- 151st hourly check)
=======================================================
- Student 1015 (Edith Nunes): visaStatus = null. Last updated 2026-07-28 (bulk touch only -- visa still null).
- Booking course 24991 (General English AM, booking 1567): Jul 13-Aug 7 2026, active = true.
- Zero class assignments on booking course 24991. UNCHANGED.
- HubSpot contact ID: 790679262424.
- Stale booking courses 24933 and 24934 still active -- deactivate after fixing primary issue.
- CRITICAL: course ends 2026-08-07. Aug 3 = bank holiday. Effective remaining teaching days: approx 7.
  (Jul 29-31 = 3 days, Aug 3 = closed, Aug 4-7 = 4 days = 7 total)

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Check visa status in HubSpot
NOT YET RUN:
  Check HubSpot contact 790679262424 for visa / IRP entry status.

Step 2 -- Set visa status in SIS admin
NOT YET RUN:
  Student profile 1015 -> Visa Status -> set to Approved/Issued etc.
  Or via DB (last resort):
  UPDATE students SET visa_status = 'APPROVED', updated_at = NOW() WHERE id = 1015;

Step 3 -- Assign student to class for booking course 24991
NOT YET RUN:
  SIS admin -> Booking 1567 -> Class Assignment -> assign to General English AM class.
  Start from current week (or Mon Aug 4 after bank holiday).

Step 4 -- Deactivate stale booking courses 24933 and 24934
NOT YET RUN:
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE id IN (24933, 24934) AND booking_id = 1567;

Risk / category
===============
Data -- low blast radius; reversible.
CRITICAL: only ~7 teaching days remain before course ends Aug 7.

Status
======
OPEN -- Fix NOT RUN. 151st check 29 Jul 2026 UTC.
visaStatus = null. Course ends 2026-08-07. URGENT -- must act this week.

Last checked
============
2026-07-29 UTC