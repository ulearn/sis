Issue 38 -- BC25043 still active 3 days past end (181st check, 17 Aug 2026 UTC)
Reporter: Various | Area: Booking/Course | Sheet row: 40

Symptom: Booking Course 25043 (General English PM) ended 2026-08-14 but active = true.

Root cause:
- Booking 18265 (Eduardo Roche Diaz, student 14602): CONFIRMED
- BC25043: start 2026-08-10, end 2026-08-14, active = true -- ended 3 days ago
- 0 student class assignments on this BC

Fix recipe (NOT YET RUN)
UPDATE booking_courses SET active = false WHERE id = 25043;
Verify: SELECT id,name,start_date,end_date,active FROM booking_courses WHERE id = 25043;

Risk: Data-hygiene | Reversible | Blast radius: 1 BC, 0 SCAs -- safe
Status: OPEN -- fix NOT RUN. BC25043 3d past end. 181st check 17 Aug 2026 UTC.