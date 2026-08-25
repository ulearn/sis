Issue 25 - Uyanga Tungalag (student 917)
Reporter: ST | Area: Visa / Class | Sheet row 26

SYMPTOM: Visa status not selectable as approved; student not in class-to-be-assigned list.

ROOT CAUSE (119th check Sun 26 Jul 2026 UTC):
- Student 917 (Uyanga Tungalag): visaStatus=null - 66 days since last update (May 21 2026)
- Student 917: hubspotContactId=null - cannot auto-verify visa from HubSpot
- Booking 1467: Confirmed, EUR 2,405 fully paid, confirmed=true
- Booking course 1613 (Academic Year Morning, Apr 27-Oct 30 2026): active=true, 0 class assignments
- 91 days since course start - all attendance permanently irrecoverable

FIX RECIPE (NOT YET RUN):
Step 1 - Manually verify visa approval for Uyanga Tungalag from student file / email records.

Step 2 - Set visaStatus to APPROVED (NOT YET RUN):
  UPDATE student SET visa_status = APPROVED, updated_at = NOW() WHERE id = 917;

Step 3 - Link HubSpot contact (NOT YET RUN):
  Search HubSpot contacts for 'Uyanga Tungalag' or via booking 1467 deal.
  UPDATE student SET hubspot_contact_id = <contact_id>, updated_at = NOW() WHERE id = 917;

Step 4 - Assign BC1613 to Academic Year Morning class from today (NOT YET RUN):
  INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (1613, <ay_morning_class_id>, '2026-07-27', '2026-10-30', NOW(), NOW());
  Note: 91 school days (Apr 27-Jul 25) permanently lost; assignment starts Jul 27 going forward.

RISK: Category bookings/class-assignment | Reversible yes | Blast radius single student
STATUS: OPEN - 119th check Sun 26 Jul 2026 UTC. Chronic 91 days unchanged. Fix NOT RUN. Last checked: 2026-07-26 UTC