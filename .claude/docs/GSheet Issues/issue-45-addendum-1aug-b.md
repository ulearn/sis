Issue 45 - Stale Booking Courses Bulk

Reporter: AC | Area: Renewal students | Sheet row: 47 | Check: 16th (3rd Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED):
24,466 active booking courses with end_date before 2026-08-01 - count stable (unchanged from 15th check).
Named 27-item subset: all still active=true.
Awaiting Neil decision: Option A (bulk deactivate 24,466) or Option B (27-item subset first).

Fix Recipe (NOT YET RUN):
Option A: UPDATE booking_courses SET active=false WHERE active=true AND end_date < CURRENT_DATE;
Option B: UPDATE booking_courses SET active=false WHERE id IN (<27 IDs from issue-45-addendum-1aug-a.md>);

Risk: data-hygiene/bookings, reversible, 24,466 records max, no financial impact.

Status: Open - 16th check (3rd today). NOT FIXED. 24,466 stale BCs. Awaiting Neil.
Last checked: 2026-08-01 UTC