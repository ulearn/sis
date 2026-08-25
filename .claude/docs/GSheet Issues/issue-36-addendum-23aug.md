Issue 36 (row 38) addendum 23 Aug 2026
Reporter: KC | Row 38 | 467th run 2026-08-23 UTC

ROOT CAUSE
- BA 11311 (bed 84): start 28 Jun 2026, end 22 Aug 2026 -- ended yesterday, active=true (1 day stale)
- BA 11393 (bed 88): start 22 Aug 2026, end 13 Sep 2026, active=true, fee=null -- current BA, check-in yesterday

FIX RECIPE (NOT YET RUN)
Step 1 -- Deactivate BA 11311: UPDATE booking_accommodations SET active=false,updated_at=NOW() WHERE id=11311;
Step 2 -- Set fee on BA 11393 (confirm amount first): UPDATE booking_accommodations SET fee=<amount>,updated_at=NOW() WHERE id=11393;

RISK: accommodation, reversible. Blast radius: student 14521 only.
STATUS: BA 11311 1d stale. BA 11393 fee null. Fix NOT RUN.
Last checked: 467th run 2026-08-23 UTC