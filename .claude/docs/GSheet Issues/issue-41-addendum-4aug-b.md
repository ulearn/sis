Issue 41 - Giampaolo Russo: SCA + Capel BA (3rd check Tue 4 Aug 2026 UTC)
Reporter: PG | Area: Booking/Accommodation | Sheet row: 43

Root Cause (fresh 2026-08-04 UTC, 3rd check today)
- Student 14571 (Giampaolo Russo), booking 18180, fully paid EUR 2,584.96.
- BC 24956 (GE AM, Aug 3-Sep 11): start_date=2026-08-03 (bank holiday), active=true, 0 SCAs. UNCHANGED.
- BC 24956 is one of the 21 BCs blocked on Issue 38 shunt; shunt still NOT RUN.
- Booking accommodation 11357 (bed 178, host family Aug 2-Sep 6): in place, no change.
- Capel Street booking accommodation (Sep 6-Sep 14): ABSENT from database. UNCHANGED.

Available Capel beds (provider 15) verified 4 Aug: 83, 87, 88, 89, 157, 161, 168, 173, 174, 175, 176.

Fix Recipe (NOT YET RUN)
PREREQUISITE: Run Issue 38 shunt first.
Step 1: SELECT start_date FROM booking_courses WHERE id=24956; -- Must return 2026-08-04.
Step 2: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (24956,14571,5,2026-08-04,2026-09-11);
  Note: confirm class 5 (B1 AM) or class 12 (B1 AM 2) with academic staff.
Step 3: INSERT INTO booking_accommodations (booking_id,accommodation_type,start_date,end_date,fee,bed_id) VALUES (18180,Apartment,2026-09-06,2026-09-14,<fee>,<bed_id>);
  Premium beds: 83, 161, 168, 174, 175 -- confirm availability and fee.
Step 4: Verify SCAs and BAs for booking 18180.

Risk: bookings, accommodation | Reversible: yes | student 14571 only.
URGENCY: ACT TODAY - Aug 4 is first class day; student has 0 class assignments.

Status: NOT YET RUN | Last checked: 2026-08-04 UTC (3rd check today)