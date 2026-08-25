Issue 16 Melie Villard Accommodation Dates 3 Aug 2026 1st check today 11th overall

Reporter: AC | Area: Booking / Accommodation | Sheet row: 17

Symptom: Student assigned to host Patty May 17 to Jun 7. Booking accommodation not deactivated after checkout.

Root cause (confirmed fresh 1st check 3 Aug 2026 UTC):
- Student 14498 (Melie Villard)
- Booking accommodation 11282 (booking 17897, bed 66): active = true
- Date range: 2026-05-15 to 2026-06-05 — ended 59 days ago (was 56 days on last check Fri 31 Jul)
- Fee: EUR 720. No other change.

Fix recipe (NOT YET RUN):

Step 1 - Deactivate the stale booking accommodation:
  UPDATE booking_accommodations SET active = false WHERE id = 11282;

Step 2 - Verify:
  SELECT id, active FROM booking_accommodations WHERE id = 11282; -- expect active = false

Risk: Data hygiene. 1 record; fully reversible; blast radius minimal (cosmetic only).

Status: OPEN - Fix NOT YET RUN
Last checked: Mon 3 Aug 2026 UTC (1st check today, 11th overall)