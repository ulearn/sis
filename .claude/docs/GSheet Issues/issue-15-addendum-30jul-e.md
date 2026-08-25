== Issue 15 - Saikhantes Shagdarsuren - New SCA Needed After Holiday (132nd check)
Reporter: PG | Area: booking / class | Sheet row: 16

-- Symptom
Class assignment expired Jul 3. Holiday Jul 20-Aug 21. Needs new SCA for return Mon 24 Aug.

-- Root Cause (Thu 30 Jul 2026 UTC - 132nd check)
- Student 1001 (Saikhantes Shagdarsuren): visa_status = null
- Booking 18151: CONFIRMED, confirmed = true
- BC 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active = true
- SCA 255: class 11 (B1 PM), week_start 2026-01-12, week_end 2026-07-03 - expired 27 days ago. No replacement SCA.
- Holiday 2500: Jul 20-Aug 21. Returns Mon 24 Aug 2026.
- Old BC 1982 (bk1724, Academic Year Morning, ended Dec 19 2025): still active - stale.

-- Fix Recipe (NOT YET RUN)

Step 1 - Create new SCA for return:
  INSERT INTO student_class_assignments
    (booking_course_id, class_id, week_start, week_end, student_id, created_at, updated_at)
  VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001, NOW(), NOW());

  Verify: SELECT id, class_id, week_start, week_end FROM student_class_assignments
  WHERE booking_course_id = 24925 ORDER BY week_start DESC LIMIT 3;

Step 2 - Deactivate stale BC 1982 (cosmetic):
  UPDATE booking_courses SET active=false WHERE id=1982;

Step 3 - Confirm visa_status via HubSpot for student 1001.

-- Risk
Reversible. Blast: 1 SCA + 1 BC. Not urgent until week before Aug 24.

-- Status
NOT YET RUN. Returns Mon 24 Aug 2026. Last checked: Thu 30 Jul 2026 UTC (132nd check)