## Issue 24 addendum 2026-07-30 (2nd run today)
Hash change: column B updated. Data unchanged.
Student 1052 Alberto Squillace: visaStatus=null, touched 2026-07-28 09:38 UTC.
BC 24686 (Morning General Jul 20-Sep 18 2026): active, fee=null, no SCA. 9 teaching days lost.
BC 1797 (Morning General Apr 6-Jun 26 2026): active, 34d stale.
SCA 229: class 12, Apr 6-Apr 26 2026. Expired 95d ago.

Fix (NOT YET RUN):
Visa: UPDATE students SET visa_status='APPROVED' WHERE id=1052;
Fee: confirm BC 24686 fee from HubSpot/Fidelo then update.
Deactivate BC 1797: UPDATE booking_courses SET active=false WHERE id=1797;
SCA: INSERT student 1052, class 12, week_start 2026-07-30, week_end 2026-09-18.

Status: NOT YET RUN. 2026-07-30 UTC. 9d lost, 49d remain.