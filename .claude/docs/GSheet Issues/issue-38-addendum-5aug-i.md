Issue 38 -- Addendum 5 Aug 2026 (i) -- URGENT: BC25004 + BC25005 Still Unassigned, Start Monday 10 Aug
Reporter: Diego/Paul | Area: Holidays, Bookings, Classes | Sheet row: 40

27th check Wed 5 Aug 2026 UTC.

Status of previously flagged courses

BC 88    (Africa Mera Bachir, student 76)      Aug 3-7 2026   -- ASSIGNED + attendance entered (26th check)
BC 25038 (Eduardo Roche Diaz, student 14602)  Aug 3-7 2026   -- ASSIGNED + attendance entered (26th check)
BC 25004 (Vincenzo Contu, student 14597)      Aug 10-14 2026 -- 0 class assignments -- URGENT: starts Mon 10 Aug
BC 25005 (Claudia Mereu, student 14598)       Aug 10-14 2026 -- 0 class assignments -- URGENT: starts Mon 10 Aug

Symptom
Booking Courses 25004 (Vincenzo Contu) and 25005 (Claudia Mereu) start Monday 10 Aug 2026 with 0 class assignments.
Deadline for assignment: Friday 7 Aug 2026 (tomorrow).

Root cause
Staff have not yet assigned these booking courses to a class in SIS. Both bookings are CONFIRMED.

Booking 18226 (Vincenzo Contu, student 14597): CONFIRMED; BC 25004 = General English AM Plus, Aug 10-14, 0 class assignments
Booking 18227 (Claudia Mereu, student 14598):  CONFIRMED; BC 25005 = General English AM, Aug 10-14, 0 class assignments

Fix Recipe (NOT YET RUN)

Step 1 -- BY FRIDAY 7 AUG: Assign Vincenzo Contu (Booking Course 25004) (NOT YET RUN)
  SIS admin: Classes > To Be Assigned > Booking Course 25004 > assign to General English AM Plus class, week Aug 10-14.

Step 2 -- BY FRIDAY 7 AUG: Assign Claudia Mereu (Booking Course 25005) (NOT YET RUN)
  SIS admin: Classes > To Be Assigned > Booking Course 25005 > assign to General English AM class, week Aug 10-14.

If SIS admin assignment is not available, direct SQL (psql or Prisma Studio):
  SELECT id, name FROM "Class" WHERE name ILIKE '%AM Plus%' OR name ILIKE '%Morning Plus%' LIMIT 10;
  INSERT INTO "StudentClassAssignment" (booking_course_id, class_id, week_start, week_end, created_at, updated_at)
  VALUES (25004, <class_id>, '2026-08-10', '2026-08-14', NOW(), NOW());
  SELECT id, name FROM "Class" WHERE name ILIKE '%General English AM%' OR name ILIKE '%Morning General%' LIMIT 10;
  INSERT INTO "StudentClassAssignment" (booking_course_id, class_id, week_start, week_end, created_at, updated_at)
  VALUES (25005, <class_id>, '2026-08-10', '2026-08-14', NOW(), NOW());

Risk
Category: Bookings / Classes
Severity: HIGH -- students start Monday without a class placement
Reversible: Yes -- delete the StudentClassAssignment row if wrong class

Status: Pending -- fix NOT YET RUN
Last checked: Wed 5 Aug 2026 UTC (27th hourly run)