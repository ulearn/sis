# Issue 37 — Bed 83 stale booking accommodations (44th check, Tue 18 Aug 2026 UTC)

Reporter: KC | Area: Accommodation | Sheet row: 39

## Symptom
Multiple stale booking accommodations on bed 83 remain active after end dates.

## Root cause
5 stale BAs on bed 83 (all active = true, all past end date as of 18 Aug 2026):

BA 11239 (booking 22): ended May 24 — 87 days stale, fee EUR 1,050
BA 11168 (booking 92): ended Jun 20 — 60 days stale, fee EUR 700
BA 11285 (booking 17825): ended Jul 5 — 45 days stale, fee null (!)
BA 11352 (booking 18156): ended Jul 11 — 39 days stale, fee EUR 360
BA 11179 (booking 82): ended Aug 9 — 10 days stale, fee EUR 1,360

Active/future — DO NOT deactivate:
BA 25 (booking 17844, Alessandro Signorotti): 2026-08-30 to 2026-10-11, fee EUR 2,100 — check-in 12 days URGENT

## Fix recipe (NOT YET RUN)
Step 1: Confirm fee for BA 11285 with accounts (booking 17825, Jun 21 to Jul 5).
Step 2: UPDATE booking_accommodations SET fee = <confirmed>, updated_at = NOW() WHERE id = 11285;
Step 3: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id IN (11239, 11168, 11285, 11352, 11179);
Step 4 verify: SELECT id, active FROM booking_accommodations WHERE id IN (11239, 11168, 11285, 11352, 11179) AND active = true; -- expect 0 rows
Step 5 confirm BA 25 still active: SELECT id, active FROM booking_accommodations WHERE id = 25;

## Risk
Category: data-hygiene | Reversible: yes | Blast radius: 5 BA rows | BA 11285 fee null requires confirmation first

## Status
Pending. 87d max stale. BA 11285 fee null. Aug 30 check-in 12 days. Fix NOT RUN.
Last checked: Tue 18 Aug 2026 UTC (44th check)