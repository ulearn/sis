# Issue 38 addendum — 29th hourly Tue 21 Jul 2026 UTC

Status: UNCHANGED. August Bank Holiday Mon 3 Aug 2026 still absent from school_closures.
13 days until Aug BH. October BH Mon 26 Oct 2026 also absent.

Impact:
  202 active booking courses span Mon 3 Aug 2026
  114 active booking courses span Mon 26 Oct 2026

Fix recipe (NOT YET RUN):
1. Insert school_closure record: name = August Bank Holiday, startDate = 2026-08-04 00:00:00 UTC, endDate = 2026-08-04 00:00:00 UTC
   NOTE: school closures are stored as UTC midnight; the display is the local date. Use 2026-08-03T23:00:00Z (Dublin BST = UTC+1) or confirm the storage pattern matches existing records.
   Existing pattern check: Good Friday id=1 is stored as 2026-04-03 — confirm this is midnight UTC for local date 3 Apr.
2. Insert school_closure for October BH: name = October Bank Holiday, date = 2026-10-26
3. Trigger end-date shunt for all 202 active BCs that span Aug 3 (and 114 for Oct 26)
   The shunt adds 1 school day to the endDate of affected BCs.

See base recipe: issue-38-course-date-ux.md
Risk: bookings/course-end-dates. Reversible (shunt can be reversed). 202 BCs affected.
Last checked: Tue 21 Jul 2026 UTC (29th hourly, 102nd check).