# Issue 23 Addendum 11 Aug 2026

This is the 10th check (Tue 11 Aug 2026 UTC). No change since 9th check.

## Root Cause (unchanged)
- BC 826 (ended 2025-11-28): active=true, 256 days stale
- BC 827 (ended 2026-01-30): active=true, 192 days stale
- BC 828 (start 2026-03-02, end 2026-02-27): backwards dates, active=true
- BC 829 (ended 2026-06-05): active=true, 67 days stale

## Fix Recipe (NOT YET RUN)
1. UPDATE booking_course SET active = false WHERE id IN (826, 827, 829);
2. Check booking 787 for correct end date of BC 828, then UPDATE booking_course SET end_date = correct_date, active = false WHERE id = 828;

## Risk: data-hygiene, reversible, 1 student (Enshi Lu)

**Last checked:** Tue 11 Aug 2026 UTC (10th check)
