# Issue 41 - Giampaolo Russo SCA+Capel (91st check Mon 3 Aug 2026 UTC, 20th today)
Reporter: PG | Area: Booking/Accomm | Sheet row: 43

Root Cause (fresh):
- BC 24956 (GE AM, bk18180): start_date=2026-08-03 (BH), active=true, 0 SCAs -- blocked on Issue 38 shunt
- BA 11357 (bed 178, host family): Aug 2-Sep 6 2026, active=true -- in place OK
- Capel Street BA (Sep 6-Sep 14 2026): absent from booking 18180 in DB
- First class tomorrow Tue 4 Aug (after shunt shifts start to Aug 4)

Fix Recipe (NOT YET RUN):
Step 0: Run Issue 38 shunt first (issue-38-addendum-3aug-l.md)
Step 1: Verify BC 24956 now has start_date=2026-08-04
Step 2: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (24956,14571,<class_id>,'2026-08-04','2026-09-11'); -- confirm class_id for level
Step 3: Find Capel bed: SELECT b.id FROM accommodation_beds b JOIN accommodation_rooms r ON r.id=b.room_id JOIN accommodation_properties p ON p.id=r.property_id WHERE p.name LIKE '%Capel%';
Step 4: INSERT INTO booking_accommodations (booking_id,bed_id,start_date,end_date,active,fee) VALUES (18180,<capel_bed_id>,'2026-09-06','2026-09-14',true,<fee>);
Step 5: SELECT id,class_id,week_start FROM student_class_assignments WHERE booking_course_id=24956;

Risk: bookings/accomm | Reversible: yes | Blast: student 14571 (Giampaolo Russo)
Status: 91st check. 0 SCAs. Capel BA missing. First class Tue Aug 4. URGENT. Fix NOT RUN. Last checked: 2026-08-03 UTC
