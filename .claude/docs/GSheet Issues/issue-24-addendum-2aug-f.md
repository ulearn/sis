# Issue 24 — Alberto Squillace SCA + Fee (addendum 2 Aug 2026 — run F)
Reporter: PG | Area: Bookings | Sheet row: 25

Status: 29th check, 9th today

Student Alberto Squillace (student 1052, booking 1611) returns Tue 4 Aug 2026
(after Aug Bank Holiday).

Booking 1611: CONFIRMED, confirmed=true, amountPaid=EUR 1,280.12, amountOpen=EUR 0 (fully paid).
BC 24686 (Morning General, Jul 20-Sep 18 2026): active, fee=null, 0 class assignments — confirmed.
BC 1797 (Morning General, Apr 6-Jun 26 2026): active=true — 37 days stale (ended Jun 26).
Last SCA: id 229, class 12, weekEnd Apr 26 2026 (on BC 1797).

Fix recipe (NOT YET RUN):

1. Set fee on BC 24686 (booking fully paid, fee field is null):
   UPDATE booking_courses SET fee = 1280.12 WHERE id = 24686;
   (Confirm exact fee with AC if needed — amountOpen=0 so fee approx 1280.)

2. Create SCA for week beginning Tue 4 Aug (after Bank Holiday):
   INSERT INTO student_class_assignments
     (booking_course_id, student_id, class_id, week_start, week_end, created_at, updated_at)
   VALUES (24686, 1052, 12, '2026-08-04', '2026-08-08', NOW(), NOW());
   (Class 12 = last known class; confirm level still appropriate with AC.)

3. Deactivate stale BC 1797:
   UPDATE booking_courses SET active = false WHERE id = 1797;

4. Verify:
   SELECT id, active, fee FROM booking_courses WHERE id IN (24686, 1797);
   SELECT id, class_id, week_start, week_end FROM student_class_assignments
     WHERE student_id = 1052 ORDER BY week_end DESC LIMIT 3;

Risk: bookings/class | Reversible | 1 student | URGENT: student returns Tue 4 Aug
Status: NOT RUN | Last checked: 2026-08-02 UTC (29th check, 9th today)
