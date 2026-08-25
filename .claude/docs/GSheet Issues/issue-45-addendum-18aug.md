# Issue 45 — Stale Active Booking Courses (bulk)

**Reporter:** AC | **Area:** Renewal students | **Sheet row:** 47
**Last checked:** 2026-08-18 UTC (109th check)

## Root cause (evidence from live DB)

- 24,497 Booking Courses with end_date < 2026-08-18 and active = true
- Most recently ended stale: IDs 1591, 1344, 1305, 24, 1572 — all ended 2026-08-14 (4 days ago)
- Count unchanged from previous runs — bulk deactivation not yet applied

## Fix recipe (NOT YET RUN)

### Step 1 — Backup
SELECT COUNT(*) FROM booking_courses WHERE end_date < CURRENT_DATE AND active = true;
COPY (SELECT id FROM booking_courses WHERE end_date < CURRENT_DATE AND active = true) TO '/tmp/stale_bc_backup.csv' CSV HEADER;

### Step 2 — Bulk deactivation
UPDATE booking_courses SET active = false WHERE end_date < CURRENT_DATE AND active = true;
Expected: ~24,497+ rows affected.

### Step 3 — Verify
SELECT COUNT(*) FROM booking_courses WHERE end_date < CURRENT_DATE AND active = true; -- Should return 0

### Step 4 — Spot-check active students
SELECT bc.id, bc.name, bc.end_date FROM booking_courses bc
JOIN bookings b ON b.id = bc.booking_id WHERE b.status = 'CONFIRMED' AND bc.end_date >= CURRENT_DATE LIMIT 20;

## Risk / category
- data-hygiene | high volume (~24,497 rows) | reversible via backup CSV | blast radius: dashboard/arrivals queries
- Urgency: medium — causes arrivals list gaps; does not delete data

## Status
Open — 24,497 stale BCs. Fix script prepared but not run.
**Last checked:** 2026-08-18 UTC