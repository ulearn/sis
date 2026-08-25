# Issue 41 Addendum 13 Aug 2026 (57th check) -- Giampaolo Russo Apartment Bed Unassigned

Reporter: AC  Area: Booking / Accomm  Sheet row: 43

## Root Cause (57th check -- confirmed Thu 13 Aug UTC)
- Booking Accommodation 11392 (Sep 6-14 2026): bedId = null -- still unassigned
- Fee = EUR 415 (confirmed, correctly set)
- Booking Accommodation 11357 (host family, bed 178, Aug 2-Sep 6): correctly assigned
- 24 days to Sep 6 check-in

## Bed Availability (confirmed Thu 13 Aug)
Bed 168 (Capel): stale BAs 23, 11257, 11167, 11360 all ended before Aug 9 -- physically free for Sep 6-14
Beds 177 and 194: also available (no confirmed conflicts)

## Fix Recipe -- NOT YET RUN

Step 1 (NOT YET RUN): Assign bed 168 (or 177/194) to BA 11392
  UPDATE booking_accommodation SET bed_id = 168 WHERE id = 11392;

Step 2: Verify no real overlap on bed 168 for Sep 6-14
  SELECT id, start_date, end_date, active FROM booking_accommodation
  WHERE bed_id = 168 AND start_date < '2026-09-14' AND end_date > '2026-09-06';
  Expect: only BA 11392 (stale ones already ended).

## Risk
Category: accommodation assignment. Reversible. Blast radius: 1 student.
Urgency: Moderate -- check-in Sep 6 (24 days).

## Status
Fix NOT RUN. 57 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (57th check)
