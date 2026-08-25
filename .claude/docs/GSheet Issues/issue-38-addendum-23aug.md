Issue 38 -- BC 25043 Stale Booking Course (476th run, 23 Aug 2026 UTC)
Reporter: various | Sheet row 40

Root cause: Booking Course 25043 (General English PM, booking 18265) started 10 Aug, ended 14 Aug 2026. active=true -- 9 days stale. 0 Student Class Assignments, safe to deactivate.

Fix recipe (NOT YET RUN)
UPDATE booking_courses SET active = false WHERE id = 25043;
Verify: SELECT id, name, start_date, end_date, active FROM booking_courses WHERE id = 25043;

Risk: data-hygiene | Reversible: SET active=true | 1 row, 0 SCAs
Status: FIX NOT RUN.
Last checked: 2026-08-23 UTC (476th run)
