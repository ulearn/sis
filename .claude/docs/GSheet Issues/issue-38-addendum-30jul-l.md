# Issue 38 Addendum 30jul-l (10th check Thu 30 Jul 2026 UTC)

Status: NOT RUN. school_closures still missing Aug 3 BH. 20 BCs start Aug 3 (unchanged). BC 25006 ends Aug 3. DEADLINE TOMORROW Fri 31 Jul. See 30jul-k for full recipe.

Verification: SELECT COUNT(*) FROM school_closures WHERE start_date=2026-08-03; -- returns 0
SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true; -- returns 20
