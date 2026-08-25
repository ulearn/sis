# Issue 43 ## Jesus Manuel Ramirez Diaz / Bed 83 (31st check)
Reporter: | Area: Booking/Accomm | Sheet row 45 | Fri 14 Aug 2026 UTC

Same bed 83 issue as Issue 37. See issue-37-addendum-14aug-b.md for full recipe.
- BA 11285 (this student): ended 2026-07-05 (40d stale), fee = null
- 5 BAs on bed 83 still active. Rosa Maria Mollica check-in Aug 30 (16 days).

## Fix (NOT YET RUN)
  Same deactivation as Issue 37: UPDATE booking_accommodation SET active = false WHERE id IN (11239,11168,11285,11352,11179);

Status: Open - fix NOT RUN. Last checked: 2026-08-14 UTC (31st)