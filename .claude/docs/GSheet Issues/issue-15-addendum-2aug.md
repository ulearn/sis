Issue 15 - Saikhantes Shagdarsuren (student 1001) - SCA needed on return
Reporter: PG | Area: Booking / Class | Sheet row: 16

Symptom
Course dates and holidays confusing. Student on holiday; no class assignment for post-holiday period.

Root cause - 11th check Sun 2 Aug 2026 UTC (3rd today)
- Holiday 2500 (booking 18151): Jul 20-Aug 21 2026 - student returns Mon 24 Aug (22 days).
- Last SCA: id 255, class 11 PM, booking course 24925, week_end = 2026-07-03 - 30 days since last assignment.
- BC 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active=true - 0 SCAs after Jul 3.
- BC 1982 (Academic Year Morning, Jun 30-Dec 19 2025): active=true - 226 days stale (Fidelo legacy).
- Student visa_status = null.
- No new SCA created since previous runs - action required before Aug 24.

Fix recipe - NOT YET RUN

Step 1: Create new SCA for post-holiday period
  Confirm class 11 (B1 PM) is still correct with Paul, then:
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, 2026-08-24, 2026-10-02);
  week_start = Aug 24 (return Monday); week_end = Oct 2 (BC 24925 end date)

Step 2: Deactivate legacy BC 1982
  UPDATE booking_courses SET active = false WHERE id = 1982;
  BC 1982: Academic Year Morning, ended Dec 19 2025 - 226 days stale (Fidelo artefact)

Step 3: Set visa status if approved
  UPDATE students SET visa_status = Approved WHERE id = 1001;
  Verify visa is confirmed approved before running

Step 4: Verify
  SELECT id, class_id, week_start, week_end FROM student_class_assignments
  WHERE booking_course_id = 24925 ORDER BY week_end;
  -- SCA 255 (to Jul 3) + new SCA (Aug 24-Oct 2)
  SELECT active FROM booking_courses WHERE id = 1982;
  -- Should return: false

Risk / category
Category: bookings (class assignment gap) | Reversible: Yes
Blast radius: 1 student; time-sensitive - must act before Aug 24

Status: Open - NOT YET RUN (22 days until student returns Mon 24 Aug)
Last checked: Sun 2 Aug 2026 UTC (10th check, 2nd today)
