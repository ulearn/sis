# Issue 45 - Stale Active Booking Courses (Bulk)
Reporter: AC | Area: Renewal students | Sheet row 47 | 468th check Mon 24 Aug 2026 UTC

## Root Cause (verified from live DB, 24 Aug 2026)
Stale active Booking Courses (active = true, end_date < today): 24,516
Count unchanged from Sun 23 Aug (also 24,516).
Oldest: end_date 1899-12-31 (BC id 24047, migration artefact).

## Fix Recipe (NOT YET RUN)
BEGIN;
UPDATE booking_courses SET active = false, updated_at = NOW()
WHERE active = true AND end_date < CURRENT_DATE;
-- Verify: SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
-- If count = 0: COMMIT; else ROLLBACK

CAUTION: 24,516 rows. Run off-hours. Verify student_class_assignments not cascaded.

## Risk
Category: Bookings / data-hygiene. Partially reversible (transaction only). Blast radius: 24,516 records.

## Status
Fix NOT RUN. Count stable at 24,516. Last checked: 2026-08-24 UTC.