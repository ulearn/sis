## Issue 15 addendum 2026-07-30 (2nd run today)
Hash artefact. Data unchanged.
Student 1001 Saikhantes: on holiday Jul 20-Aug 21, returns Aug 24.
SCA 255: class 11, Jan 12-Jul 3 2026. Expired 27d ago. No active SCA.
BC 24925 (AY Afternoon Mar 9-Oct 2 2026): active.
BC 1982 (AY Morning ended Dec 19 2025): active, 223d stale.

Fix (NOT YET RUN):
Create SCA: student 1001, class 11, week_start 2026-08-24, week_end 2026-10-02.
Deactivate BC 1982: UPDATE booking_courses SET active=false WHERE id=1982;

Status: NOT YET RUN. 2026-07-30 UTC.