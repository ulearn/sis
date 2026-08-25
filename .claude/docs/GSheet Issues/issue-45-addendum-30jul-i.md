# Issue 45 Addendum 30jul-i (6th check Thu 30 Jul 2026 UTC)

Reporter: AC | Sheet row: 47

Fresh count (2nd run today, after 30jul-h):
- Jul 3: 11 BCs stale (was 12 — 1 fixed since 30jul-h)
- Jul 10: 16 BCs stale (was 18 — 2 fixed)
- Jul 17: 13 BCs stale (was 19 — 6 fixed)
- Jul 24: 9 BCs stale (was 11 — 2 fixed)
- Total Jul 3-24: 49 stale BCs (down from 60 — 11 deactivated between runs today)
- 16 BCs ending Jul 31 not yet stale: 87,1347,1454,1502,1503,1723,24609,24616,24945,24987,24998,25008,25017,25019,25021,25023

Fix (see 30jul-h for full ID list): UPDATE booking_courses SET active=false WHERE end_date BETWEEN 2026-07-03 AND 2026-07-24 AND active=true AND booking in CONFIRMED bookings.
Plus deactivate Jul 31 batch on/after Jul 31.

Status: NOT RUN. 49 stale + 16 expiring tonight.
