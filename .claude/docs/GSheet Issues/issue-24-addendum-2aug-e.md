Issue 24 — Alberto Squillace BC Fee + SCA (addendum 2 Aug 2026 — run E)
Reporter: pg | Area: Bookings | Sheet row: 25

Status: 28th check, 8th today

Student returns Tue 4 Aug 2026 (tomorrow after Bank Holiday).
BC 24686 (Morning General, Jul 20-Sep 18): active, fee=null, 0 SCAs — 99 days since last SCA.
BC 1797 (Morning General, Apr 6-Jun 26): active=true — 37 days stale (ended Jun 26).
No new changes since prior check.

Fix recipe (NOT YET RUN):

1. Check booking 1611 for correct fee:
   SELECT amount_paid, amount_open FROM bookings WHERE id = 1611;

2. Set fee on BC 24686:
   UPDATE booking_courses SET fee = <correct_fee> WHERE id = 24686;

3. Create SCA for week Aug 4 (after Bank Holiday):
   INSERT INTO student_class_assignments
     (booking_course_id, student_id, class_id, week_start, week_end, created_at)
   VALUES (24686, <student_id>, <class_id>, '2026-08-04', '2026-08-08', NOW());
   (Use class 12 if same level as BC 1797, or confirm with AC.)

4. Deactivate stale BC 1797:
   UPDATE booking_courses SET active = false WHERE id = 1797;

Risk: bookings/class | reversible | 1 student | URGENT: returns Tue Aug 4
Status: NOT RUN | Last checked: 2026-08-02 UTC (28th check, 8th today)
