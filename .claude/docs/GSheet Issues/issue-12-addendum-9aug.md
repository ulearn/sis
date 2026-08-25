# Issue 12 Addendum 9 Aug
Reporter: Staff | Row: 13 | Check: 131st Sun 9 Aug 2026 UTC

## Symptom
Student SCA dates mislinked; Rakan not visible on class-to-be-assigned list.

## Root Cause — unchanged
- BC 24697 (Academic Year Morning, Rakan Alghamdi): ended 31 Jul 2026, stale 9 days, active = true
- Class Assignment 288: linked to BC 24697, weekStart 6 Jul to weekEnd 18 Dec 2026 — extends 140 days past BC end (mislinked)
- BC 25035 (GE Academic Year AM Plus, Rakan): started 3 Aug 2026, end 18 Dec — active = true, 0 class assignments, 6 school days in

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE booking_courses SET active = false WHERE id = 24697;
Step 2: DELETE FROM class_assignments WHERE id = 288;
Step 3: Assign BC 25035 via SIS Admin, Classes.

## Risk: Class assignments. Reversible. 1 student, 1 BC, 1 SCA.
## Status: Open. NOT RUN. BC 24697 stale 9d. BC 25035 0 SCAs 6 days.
## Last Checked: Sun 9 Aug 2026 UTC (131st check)