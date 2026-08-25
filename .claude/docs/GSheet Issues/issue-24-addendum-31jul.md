# Issue 24 addendum 2026-07-31 (3rd check)
Data unchanged from 30 Jul. BC 24686 still active with no SCA and no fee. 1 more teaching day lost.

Student 1052 (Alberto Squillace): visaStatus=null, last touched 2026-07-28 09:38 UTC.
BC 24686 (Morning General, Jul 20 to Sep 18 2026): active=true, fee=null, bookingId=1611.
  No student class assignment found for BC 24686.
  Teaching days lost as of today Fri Jul 31: 10 (Jul 20-24 week + Jul 27-31 week).
  Teaching days remaining from Aug 4: ~34 (Aug Bank Holiday Aug 3 excluded).
  Note: previous recipe (30jul-c) said 49d remain -- that figure was incorrect; correct is ~34.
BC 1797 (Morning General, Apr 6 to Jun 26 2026): active=true, fee=1836, 35d stale.
SCA 229: class 12, week_start=Apr 6 to week_end=Apr 26 2026. Expired 96d ago. No active SCA.

Fix (NOT YET RUN):
1. Set visa status (confirm from HubSpot first):
   UPDATE students SET visa_status='APPROVED', updated_at=NOW() WHERE id=1052;
2. Set BC 24686 fee (confirm from HubSpot deal):
   UPDATE booking_course SET fee=<amount>, updated_at=NOW() WHERE id=24686;
3. Deactivate BC 1797:
   UPDATE booking_course SET active=false, updated_at=NOW() WHERE id=1797;
4. Create student class assignment for BC 24686 (class 12 or re-assign):
   INSERT INTO student_class_assignment (student_id, class_id, week_start, week_end, ...)
   -- Use SIS admin UI to add SCA from Aug 4 to Sep 18 (next available teaching week).

Status: NOT YET RUN. 2026-07-31 UTC. Alberto is CURRENTLY enrolled (BC 24686 active to Sep 18).
Risk: Medium -- Alberto has no class for 10 teaching days. Fix needed urgently.