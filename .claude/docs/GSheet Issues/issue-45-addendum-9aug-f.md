# Issue 45 -- Renewal Students: 24,479 Stale Booking Courses (99%)
Check: 52nd, Sun 9 Aug 2026 UTC | Reporter: (staff) | Row: 47

ROOT CAUSE
Total active booking courses: 24,762
Stale (ended before 9 Aug 2026): 24,479 -- 99% of all active records
Current (ending on or after today): 283 records
Unchanged since last check.

FIX RECIPE -- NOT YET RUN

Dry run first:
  SELECT COUNT(*)::int FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  Expect: ~24,479

Mass deactivation:
  UPDATE booking_courses
  SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < CURRENT_DATE;

Verify after:
  SELECT COUNT(*)::int FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  Expect: 0

  SELECT COUNT(*)::int FROM booking_courses WHERE active = true AND end_date >= CURRENT_DATE;
  Expect: ~283 (same as pre-run current count)

RISK: Category=Data hygiene/Bookings | Reversible=Yes | High blast radius (24,479 records)
Caution: run off-peak; verify a sample before committing

STATUS: Open -- Fix NOT RUN (pending Neil approval for mass update)
Last checked: Sun 9 Aug 2026 UTC (52nd check) | 24,479 stale (99%), 283 current
