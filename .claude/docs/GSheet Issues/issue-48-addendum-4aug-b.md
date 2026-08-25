Issue 48 - Fassina/Galbusera Stale BCs + Orphan Payments (47th check Tue 4 Aug 2026 UTC)
Reporter: | Area: Booking/Payments | Sheet row: 50

Root Cause (fresh 2026-08-04 UTC)
- BC 24630 (Fassina, General English AM Plus, ended 2026-07-10): active=true, 26 days stale.
- BC 24631 (Galbusera, General English AM Plus, ended 2026-07-10): active=true, 26 days stale.
- BC 25006 (Marina Larripa, General English AM Plus, ended 2026-08-03): active=true, 2 days stale.
- Payment 16988 (EUR 339.90): booking_id=null, xero=null, 103 days unlinked.
- Payment 16989 (EUR 339.90): booking_id=null, xero=null, 103 days unlinked.
4 items open. All unchanged.

Fix Recipe (NOT YET RUN)
Step 1: UPDATE booking_courses SET active=false WHERE id IN (24630,24631,25006);
Step 2: UPDATE payments SET booking_id=17856 WHERE id=16988;
Step 3: UPDATE payments SET booking_id=17857 WHERE id=16989;
Step 4: Verify all items resolved.

Risk: data-hygiene, money | Reversible: yes.

Status: NOT YET RUN | Last checked: 2026-08-04 UTC (47th check)