Issue 41 - Giampaolo Russo (student 14571)
Reporter: Diego | Area: Booking / Accomm | Sheet row 43

SYMPTOM: Two accommodation bookings (host family + Capel Street) neither appearing in SIS.

ROOT CAUSE (119th check Sun 26 Jul 2026 UTC):
- Booking 18180 (Giampaolo Russo, student 14571): Confirmed, EUR 2,584.96 fully paid
- Booking accommodation 11357 (bed 178, host family, Aug 2-Sep 6 2026): present, active=true, fee=EUR 1,250
- Capel Street booking accommodation (Sep 6-14): STILL MISSING from booking 18180
- Booking course 24956 (General English AM, Aug 3-Sep 11 2026): active=true, 0 class assignments
- BC24956 start date Aug 3 must shunt to Aug 4 via Issue 38
- Check-in: Aug 2 - 7 calendar days away

FIX RECIPE (NOT YET RUN):
Step 1 - Find Capel Street bed ID (NOT YET RUN):
  SELECT b.id, b.name, r.name as room, pr.name as property FROM bed b JOIN room r ON b.room_id = r.id JOIN property pr ON r.property_id = pr.id WHERE pr.name ILIKE '%capel%';

Step 2 - Add Capel Street booking accommodation (NOT YET RUN):
  INSERT INTO booking_accommodation (booking_id, bed_id, start_date, end_date, active, fee, created_at, updated_at) VALUES (18180, <capel_bed_id>, '2026-09-06', '2026-09-14', true, <fee>, NOW(), NOW());
  Note: 1 week + 1 extra night. Verify end-date convention (inclusive vs exclusive).

Step 3 - Shunt BC24956 to Aug 4 via Issue 38 bulk fix (no separate action needed).

Step 4 - Assign BC24956 to General English AM class (NOT YET RUN):
  INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (24956, <class_id>, '2026-08-04', '2026-09-11', NOW(), NOW());

Step 5 - Verify both accommodations and course visible in SIS before check-in Aug 2.

RISK: Category bookings/accommodation | Reversible yes | Blast radius single student (check-in 7d)
STATUS: OPEN - 119th check Sun 26 Jul 2026 UTC. Fix NOT RUN. Last checked: 2026-07-26 UTC