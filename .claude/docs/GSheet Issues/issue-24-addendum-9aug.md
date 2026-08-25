# Issue 24 Addendum 9 Aug
Reporter: Staff | Row: 25 | Check: 65th Sun 9 Aug 2026 UTC

## Root Cause - unchanged
- BC 24686 (Morning General, Alberto Squillace): started 20 Jul 2026, ends 18 Sep 2026, active=true, 0 SCAs, 20 days since start
- BC 1797 (Morning General): ended 26 Jun 2026, 44 days stale, active=true, 1 stale SCA
- Booking 1611: Confirmed, confirmed=true, fully paid EUR 1280.12
- Student 1052: visa_status=null

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE booking_courses SET active = false WHERE id = 1797;
Step 2: Assign BC 24686 to class via SIS Admin.
Step 3 (optional): Set visa_status on student 1052 if visa approved.

## Risk: Class assignments. Reversible. 1 student.
## Status: Open. NOT RUN. BC 24686 0 SCAs 20d since start.
## Last Checked: Sun 9 Aug 2026 UTC (65th check)