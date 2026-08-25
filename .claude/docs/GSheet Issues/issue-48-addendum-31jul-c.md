Issue 48 - Multiple Class and Attendance Issues (7th check, Fri 31 Jul 2026 UTC)
Reporter: AC, Area: Attendance/Classes, Sheet row: 50

STATUS: UNCHANGED - all 4 items still open.

EVIDENCE (live DB, Fri 31 Jul 2026):

Fassina (student 14462, booking 17857):
  confirmed = false, amount_total = 339.90, amount_paid = 339.90 (fully paid)
  BC 24630 (General English AM Plus, Jun 29 - Jul 10): active = true, 21 days stale
  No student_class_assignments linked to student 14462
  No local payment records (amount_paid must be synced from HubSpot)

Galbusera (student 14463, booking 17856):
  confirmed = false, amount_total = 339.90, amount_paid = 339.90 (fully paid)

Saikhantes Shagdarsuren (student 1001):
  Last SCA: id 255, week_start 2026-01-12, class B1 PM (class 11)
  Holiday ends Aug 21; returns week of Aug 24 - no SCA for Aug 24 yet
  Active BC for Saikhantes needs to be confirmed before inserting SCA

Enshi Lu: see prior recipes for BC 829 stale details.

FIX RECIPE (NOT YET RUN):

Step 1 - Set confirmed = true for bookings 17857 and 17856:
  SQL (NOT YET RUN):
  UPDATE bookings SET confirmed = true, updated_at = NOW() WHERE id IN (17857, 17856);

Step 2 - Deactivate stale BC 24630 (Fassina):
  SQL (NOT YET RUN):
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24630;

Step 3 - Add Saikhantes SCA for return week Aug 24:
  First confirm which BC is active for student 1001.
  Then (NOT YET RUN):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, created_at)
  VALUES (1001, <ACTIVE_BC_ID>, 11, '2026-08-24', NOW());

RISK: Bookings + Attendance - reversible. Blast radius: 2 bookings + 1 SCA row.
STATUS: OPEN - Fix NOT RUN - Last checked: Fri 31 Jul 2026 UTC (7th check)
