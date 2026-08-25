Issue 45 Addendum 23 Aug 2026 (466th check)
Sheet row 47 | Reporter: AC | Area: Renewal students / Booking Courses

Symptom: Renewal students not appearing on arrivals list even though their courses are set.

Root cause (unchanged):
24,515 stale active Booking Courses - courses with end_date in the past still have active = true.
Arrivals list filters on active BCs, so ended-but-active ones crowd out current ones.
Oldest entry: end_date 1899-12-31, BC id 24047, name Unknown Course (Fidelo migration artefact).

Current count:
Stale active Booking Courses (end_date < now, active = true): 24,515 - unchanged from 465th check (14:14 UTC today).

Fix recipe (NOT YET RUN):
Preview: SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < NOW();
Expected: 24,515
Apply: UPDATE booking_courses SET active = false WHERE active = true AND end_date < NOW();

Risk: bookings/data-hygiene | reversible | blast radius 24,515 rows, all already ended
Status: Fix NOT RUN. 466th check. Last checked: 2026-08-23 UTC.