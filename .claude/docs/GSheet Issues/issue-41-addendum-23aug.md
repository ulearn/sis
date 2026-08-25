Issue 41 addendum 23 Aug 2026
Reporter: KC | Row 43 | 467th run 2026-08-23 UTC

ROOT CAUSE
- BA 11357 (bed 178): 2 Aug - 15 Aug 2026, active=true, fee=1250 -- 8 days stale
- BA 11396 (bed 44): 15 Aug - 22 Aug 2026, active=true, fee=null -- 1 day stale (ended yesterday)
- BA 11397 (bed 89): 22 Aug - 6 Sep 2026, active=true, fee=null -- current (started yesterday)
- BA 11392 (bed 168): 6 Sep - 14 Sep 2026, active=true, fee=415 -- future, not stale

FIX RECIPE (NOT YET RUN)
Step 1 -- Deactivate stale BAs: UPDATE booking_accommodations SET active=false,updated_at=NOW() WHERE id IN(11357,11396);
Step 2 -- Set fee on BA 11397 (confirm amount first): UPDATE booking_accommodations SET fee=<amount>,updated_at=NOW() WHERE id=11397;
Step 3 -- Verify: SELECT id,bed_id,start_date,end_date,active,fee FROM booking_accommodations WHERE id IN(11357,11392,11396,11397) ORDER BY id;

RISK: accommodation, reversible. Blast radius: student 14571 only.
STATUS: BAs 11357 (8d) and 11396 (1d) stale. BA 11397 fee null. Fix NOT RUN.
Last checked: 467th run 2026-08-23 UTC