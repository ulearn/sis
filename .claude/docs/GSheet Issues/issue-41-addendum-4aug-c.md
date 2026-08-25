# Issue 41 -- Giampaolo Russo: SCA + Capel Accommodation (5th check Tue 4 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accommodation | Sheet row: 43

## Symptom
Russo booked host family (Aug 2-Sep 6) + Capel Street apartment (Sep 6-Sep 14).
Capel accommodation not in SIS. Not appearing in class matching.
School open today (day 2); Russo attending with 0 class assignments.

## Root Cause (verified 2026-08-04 UTC, 5th check)
- Student 14571 (Giampaolo Russo), booking 18180: CONFIRMED, confirmed = true,
  fully paid EUR 2,584.96, EUR 0 open.
- Booking course 24956 (General English AM, Aug 3-Sep 11): startDate = 2026-08-03,
  active = true, 0 class assignments.
- BC 24956 is one of 21 BCs affected by Aug Bank Holiday shunt (Issue 38) -- shunt NOT yet run.
  Once shunt runs, startDate becomes 2026-08-04, and SCA can be created.
- Booking accommodation 11357 (bed 178, host family, Aug 2-Sep 6): in place, active, fee EUR 1,250. OK.
- Capel Street accommodation (Sep 6-Sep 14): ABSENT from database.
- Available Capel beds (accommodation provider 15, confirmed Aug 4):
  83, 87, 88, 89, 157, 161, 168, 173, 174, 175, 176.

## Fix Recipe (NOT YET RUN)
PREREQUISITE: Run Issue 38 steps 1-3 first (shunt BC start dates from Aug 3 to Aug 4).

Step 1 -- Verify shunt applied to BC 24956:
  SELECT start_date FROM booking_courses WHERE id = 24956;
  Must return 2026-08-04 before proceeding.

Step 2 -- Create class assignment for BC 24956:
  Confirm class with academic staff first (B1 AM options: class 5 or class 12).
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24956, 14571, <class_id>, '2026-08-04', '2026-09-11');

Step 3 -- Create Capel Street accommodation:
  Check fee with admin, confirm bed availability for Sep 6-Sep 14 (1 week + 1 night):
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, start_date, end_date, fee, bed_id)
  VALUES (18180, 'Apartment', '2026-09-06', '2026-09-14', <fee>, <bed_id>);
  Premium Capel beds: 83, 161, 168, 174, 175 -- confirm with accommodation team.

Step 4 -- Verify result:
  SELECT ba.id, ba.start_date, ba.end_date, ba.fee
  FROM booking_accommodations ba WHERE ba.booking_id = 18180;
  Expect 2 rows: host family (Aug 2-Sep 6) + Capel (Sep 6-Sep 14).

## Risk / Category
bookings, accommodation | Reversible: yes | Student 14571 only

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (5th check, school open day 2)
URGENCY: CRITICAL -- student attending today with 0 class assignments.
         Fix immediately after running Issue 38 shunt.