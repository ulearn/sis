Issue 45 — Renewal Students Arrivals List (18th check, 4th today)
Reporter: AC | Area: Renewal Students | Sheet row: 47

Symptom: Returning/renewal students not appearing on arrivals list; bug linked to stale booking course backlog.

Root cause (Sun 2 Aug 2026 UTC, 4th check today):
- 24,466 active booking courses with end_date before 2026-08-02 — stable count (unchanged)
- BC 24697 (Rakan bk17915, AY Morning, ended Jul31 2026): today joins stale pool
- Stale BCs pollute the arrivals-list query, masking newly-starting students
- Awaiting Neil decision between two options:
  Option A: Bulk deactivate ALL 24,466 stale booking courses in one SQL update
  Option B: Named 27-item subset (specific known-stale BCs listed in prior recipes)
- Note: Option A also resolves stale BCs called out in Issues 7, 8, 10, 11, 12, 16, 19, 21, 22, 23, 26, 30, etc.

Fix recipe (NOT YET RUN):

Option A — Bulk deactivate all stale BCs (recommended):
  UPDATE booking_courses SET active = false
  WHERE end_date < '2026-08-02' AND active = true;
  Verify: SELECT COUNT(*) FROM booking_courses WHERE end_date < '2026-08-02' AND active = true; -- must be 0

Option B — Named subset (27 specific IDs — see issue-45-renewal-no-class.md for full list):
  UPDATE booking_courses SET active = false WHERE id IN ([list]);

Risk/category: Bookings; high count (24,466 records) but all genuinely stale. Reversible (SET active=true to undo). Neil decision required before run.
Status: NOT RUN — 18th check, 4th today Sun 2 Aug 2026 UTC