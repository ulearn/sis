Issue 15 - Saikhantes Shagdarsuren (student 1001) - SCA needed on return
Reporter: PG | Area: Booking / Class | Sheet row: 16

Symptom
Student on holiday Jul 20-Aug 21. Returns Mon Aug 24. No class assignment created for post-holiday period.

Root cause - 13th check Sun 2 Aug 2026 UTC (5th today)
- Holiday 2500 (booking 18151): start Jul 20 2026, end Aug 21 2026.
  Student returns Monday 24 Aug 2026 (22 days remaining).
- Last SCA: id 255, class 11 PM, booking course 24925, week_end=Jul 3 2026 - 30 days since last SCA.
- Gap Jul 3-Jul 20 (17 days): no SCA before holiday started. Likely acceptable (pre-holiday wind-down).
- Booking course 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active=true, 0 SCAs after Jul 3.
- Booking course 1982 (Academic Year Morning, Jun 30-Dec 19 2025): active=true - 226 days stale (Fidelo artefact).

Fix recipe - NOT YET RUN (22 days until Aug 24 return)

Step 1: Create post-holiday SCA on BC 24925
  Confirm class 11 (B1 PM) is still correct with Paul:
  INSERT INTO student_class_assignments (booking_course_id,class_id,week_start,week_end)
  VALUES (24925,11,'2026-08-24','2026-10-02');
  week_start=Aug 24 (return Monday); week_end=Oct 2 (BC 24925 end date).

Step 2: Deactivate legacy BC 1982
  UPDATE booking_courses SET active=false WHERE id=1982;
  BC 1982: Academic Year Morning, ended Dec 19 2025 - 226 days stale (Fidelo legacy).

Step 3: Verify
  SELECT id,class_id,week_start,week_end FROM student_class_assignments WHERE booking_course_id=24925 ORDER BY week_end;
  -- SCA 255 (to Jul 3) + new SCA (Aug 24-Oct 2)
  SELECT active FROM booking_courses WHERE id=1982;
  -- false

Risk: bookings (class assignment gap) | Reversible: Yes | Blast radius: 1 student
Time-sensitive: must act before Aug 24.

Status: Open - NOT YET RUN (22 days until return)
Last checked: Sun 2 Aug 2026 UTC (13th check, 5th today)