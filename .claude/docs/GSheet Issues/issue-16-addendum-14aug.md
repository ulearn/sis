Issue 16 check 26 Fri 14 Aug 2026

4 stale Booking Accommodations on bed 66, all still active:
  BA 11216: ended 2026-05-09, 97d stale
  BA 11158: ended 2026-05-17, 89d stale
  BA 11282: ended 2026-06-05, 70d stale
  BA 11361: ended 2026-08-09, 5d stale

Fix (NOT YET RUN):
  UPDATE booking_accommodation SET active = false WHERE id IN (11216, 11158, 11282, 11361);

Risk: data-hygiene; reversible. Blast radius: bed 66 calendar.
Status: Unchanged. Fix NOT RUN. Last checked 2026-08-14 UTC, 26th check.
