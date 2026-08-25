Issue 22 - Edite Nunes / Edith Nunes (student 1015)
Reporter: AC | Area: Booking / Class | Sheet row 23

SYMPTOM: Not appearing in TBA for wb 18.05.26; two payments with same invoice number.

ROOT CAUSE (119th check Sun 26 Jul 2026 UTC):
- Booking course 24991 (General English AM, Jul 13-Aug 7 2026): active=true, 0 class assignments
- Student: Edith Nunes (ID 1015), booking 18214, payment PMT18004 EUR 608 xeroId=null
- 10 school days already lost (Jul 13-24)
- 9 school days remain: Jul 27-31 (5d) + Aug 4-7 (4d); Aug 3 Bank Holiday needed (Issue 38)

FIX RECIPE (NOT YET RUN):
Step 1 - Find General English AM class ID (NOT YET RUN):
  SELECT id, name FROM class WHERE name ILIKE '%general english%' AND active = true;

Step 2 - Assign BC24991 to class starting Mon Jul 27 (NOT YET RUN):
  INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (24991, <class_id>, '2026-07-27', '2026-08-07', NOW(), NOW());

Step 3 - Fix Aug 3 Bank Holiday (Issue 38) to prevent attendance on that date.
Step 4 - Reconcile PMT18004 xeroId=null with Xero separately.

RISK: Category bookings/class-assignment | Reversible yes | Blast radius single student
STATUS: OPEN - 119th check Sun 26 Jul 2026 UTC. Fix NOT RUN. Last checked: 2026-07-26 UTC