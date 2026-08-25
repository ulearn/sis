# Issue 41 - Giampaolo Russo: SCA + Capel BA (1st check Tue 4 Aug 2026 UTC)
Reporter: PG | Area: Booking/Accomm | Sheet row: 43

## Root Cause (fresh - 2026-08-04 UTC)
- Student 14571 (Giampaolo Russo), level B1, booking 18180, fully paid EUR 2,584.96
- BC 24956 (GE AM, Aug 3-Sep 11): start_date=2026-08-03 (bank holiday), active=true, 0 SCAs
  BC 24956 is one of the 21 BCs in Issue 38; must shunt to Aug 4 first
- BA 11357 (bed 178, host family, Patty McSweeney): Aug 2-Sep 6, fee EUR 1,250 -- in place OK
- Capel Street BA (Sep 6-Sep 14): ABSENT from DB

Available Capel beds (provider 15) for Sep 6-14 (11 free):
  83 Premium A1, 87 Superior A2, 88 Standard A2, 89 Standard A2, 157 Twin A1,
  161 Premium A2, 168 Premium A1, 173 Twin A1, 174 Premium A1, 175 Premium A1, 176 Premium A2

B1 Morning classes: 5 (B1 AM), 12 (B1 AM (2)). Giampaolo has no prior SCAs.

## Fix Recipe (NOT YET RUN)

PREREQUISITE: Run Issue 38 shunt first (issue-38-addendum-4aug.md).

Step 1 - Verify shunt ran:
  SELECT start_date FROM booking_courses WHERE id = 24956; -- Must return 2026-08-04

Step 2 - Create class assignment (staff choose class 5 or 12):
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24956, 14571, 5, '2026-08-04', '2026-09-11');

Step 3 - Create Capel BA (staff choose bed + fee):
  INSERT INTO booking_accommodations (booking_id, accommodation_type, start_date, end_date, fee, bed_id)
  VALUES (18180, 'Apartment', '2026-09-06', '2026-09-14', <fee>, <bed_id>);
  -- Premium beds available: 83, 161, 168, 174, 175

Step 4 - Verify:
  SELECT id, class_id, week_start FROM student_class_assignments WHERE booking_course_id = 24956;
  SELECT id, bed_id, start_date, end_date, fee FROM booking_accommodations WHERE booking_id = 18180;

## Risk
Category: bookings, accommodation | Reversible: yes | Blast: student 14571 only
URGENCY: ACT TODAY - Aug 4 is first school day; student has no class assignment.

## Status: NOT RUN. Last checked: 2026-08-04 UTC