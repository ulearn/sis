Issue 43 addendum 23 Aug 2026
Reporter: AC | Row 45 | 445th check 2026-08-23 UTC

ROOT CAUSE
- BA 11285 (bed 83, Jesus Manuel Ramirez Diaz): 21 Jun-5 Jul 2026, active=true, 49d stale, fee=null
- Same bed 83 as Issue 37 (row 39) -- 5 total stale BAs
- Next arrival on bed 83: BA 25 (Rosa Maria Mollica, 30 Aug-11 Oct 2026) -- 7 days

FIX RECIPE (NOT YET RUN)
See Issue 37 recipe (issue-37-addendum-23aug.md) for full bed 83 cleanup.
Direct: UPDATE booking_accommodations SET active=false,updated_at=NOW() WHERE id=11285;
Fee: UPDATE booking_accommodations SET fee=<amount>,updated_at=NOW() WHERE id=11285;

RISK: accommodation, reversible. Blast radius: student 14439, bed 83 history.
STATUS: BA 11285 49d stale, fee null. Rosa Maria Mollica arrives 30 Aug (7 days). Fix NOT RUN.
Last checked: 445th check 2026-08-23 UTC