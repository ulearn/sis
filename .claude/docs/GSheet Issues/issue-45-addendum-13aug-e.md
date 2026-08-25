Issue 45 - Stale Booking Courses - 81st check Thu 13 Aug 2026 UTC

ROOT CAUSE: 24,479 BCs have active=true but end_date < 2026-08-13. 283 live.
No change from 80th check (earlier today).

FIX RECIPE (NOT YET RUN):
1. SELECT COUNT(*) FROM booking_course WHERE active=true AND end_date < 2026-08-13;
2. Check stale BCs with future SCAs: SELECT bc.id,bc.end_date,sca.week_end FROM booking_course bc JOIN student_class_assignment sca ON sca.booking_course_id=bc.id WHERE bc.active=true AND bc.end_date<2026-08-13 AND sca.week_end>=2026-08-13 ORDER BY sca.week_end DESC LIMIT 20;
3. Mass deactivate (after Step 2 review): UPDATE booking_course SET active=false, updated_at=NOW() WHERE active=true AND end_date<2026-08-13;
4. Verify: SELECT COUNT(*) FROM booking_course WHERE active=true AND end_date<2026-08-13; Expected: 0

RISK: data-hygiene/bookings | Reversible: yes | Blast: 24,479 records (all past end-date)
STATUS: OPEN. 81st check. Count stable at 24,479. Fix NOT RUN.