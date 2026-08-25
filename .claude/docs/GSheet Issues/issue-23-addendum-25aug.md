Issue 23 Addendum 25 Aug 2026

21st check Tue 25 Aug 2026 UTC
Booking Course 826 (Academic Year Morning): ended 2025-11-28 — 270 days stale, active = true, 0 class assignments
Booking Course 827 (Academic Year Morning): ended 2026-01-30 — 207 days stale, active = true, 0 class assignments
Booking Course 828 (Academic Year Morning): start 2026-03-02, end 2026-02-27 — BACKWARDS end date, active = true, 0 class assignments
Booking Course 829 (Academic Year Morning): ended 2026-06-05 — 81 days stale, active = true, 1 class assignment (historical)
No change from 20th check (Mon 24 Aug).

Fix (NOT YET RUN):
1. Look up correct end date for BC828 from parent booking
2. UPDATE booking_courses SET end_date = correct_date WHERE id = 828;
3. UPDATE booking_courses SET active = false WHERE id IN (826, 827, 828, 829);

Risk: bookings | reversible | Enshi Lu only
Status: Open. Last checked: 2026-08-25 UTC (520th run, 21st issue check)