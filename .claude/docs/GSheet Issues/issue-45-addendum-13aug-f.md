Issue 45 -- Stale Active Booking Courses (Thu 13 Aug 2026)

Reporter: Laura | Area: Renewal Students | Sheet row: 47
82nd check -- Thu 13 Aug 2026 ~16:04 UTC

Symptom:
24,479 Booking Courses are marked active=true but ended before today (Aug 13 2026).
Only 283 active Booking Courses have end_date on or after today.

Root Cause (evidence):
- Active BCs with endDate < 2026-08-13: 24,479 (unchanged from 81st check)
- Active BCs with endDate >= 2026-08-13: 283
- This is a migration holdover -- all pre-SIS courses imported from Fidelo with active=true
- No change since 81st check

Fix Recipe (NOT YET RUN):

Step 1 (safe, reversible): Deactivate all active BCs where end_date < today:
  UPDATE booking_courses SET active = false 
  WHERE active = true AND end_date < CURRENT_DATE;  -- NOT YET RUN
  This would affect ~24,479 rows. Test on a sample first.

Step 2: Verify live BC count after: expect ~283 active BCs remain.

Step 3: Monitor for any side-effects in class assignment views or reports.

Risk: data-hygiene | Reversible: yes (SET active=true is simple rollback) | Blast radius: 24,479 rows

Status: OPEN. 24,479 stale BCs unchanged. Mass fix pending Neil approval.
Last checked: Thu 13 Aug 2026 ~16:04 UTC
Previous recipe: issue-45-addendum-13aug-e.md