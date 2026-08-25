## Issue 45 addendum 2026-07-30 (2nd run today)
Hash artefact. Data confirmed from fresh DB query.
BC 25011 (General English PM Jul 20-24, bk18233, EUR178.50/178.50): 6d stale. DEACTIVATE NOW.
BC 25023 (General English PM Jul 27-31, bk18245, EUR126/126): ends TOMORROW Jul 31. Deactivate after Fri Jul 31 EOD.
SCA 359: student 14602 Eduardo Roche Diaz, class 6, Jul 27-31. Active this week.

Fix (NOT YET RUN):
NOW: UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25011;
After Fri Jul 31 EOD: UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25023;
Verify: SELECT id, end_date, active FROM booking_courses WHERE id IN (25011,25023);

URGENT: BC 25023 ends TOMORROW - action needed by end of Fri 31 Jul.
Status: NOT YET RUN. 2026-07-30 UTC (2nd run today).