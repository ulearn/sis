# Issue 37 Addendum 21 Aug 2026 (Evening) — Verónica Martín (Bed 83, 5 Stale BAs)

Reporter: ST | Area: Booking / Accomm | Sheet row: 39

Root cause (60th check, Fri 21 Aug 2026 evening — no change since 59th afternoon):

Bed 83 has 5 stale active Booking Accommodations plus 1 current and 1 future occupant.

Stale BAs (all active = true, end date past):
- BA 11239 (booking 22): ended 24 May 2026 — 89 days stale, fee EUR 1,050
- BA 11168 (booking 92): ended 20 Jun 2026 — 62 days stale, fee EUR 700
- BA 11285 (booking 17825): ended 5 Jul 2026 — 47 days stale, fee = null
- BA 11352 (booking 18156): ended 11 Jul 2026 — 41 days stale, fee EUR 360
- BA 11179 (booking 82): ended 9 Aug 2026 — 12 days stale, fee EUR 1,360

Current occupant: BA 11173 (booking 88): 9 Aug - 30 Aug 2026, active (9 days to end).
Next occupant: BA 25 (booking 17844): starts 30 Aug 2026, fee EUR 2,100, active.

BA 11285 fee null: Booking 17825 is CONFIRMED, fully paid EUR 2,008, open EUR 0 — set fee 2,008.

Fix recipe (NOT YET RUN):

Step 1 — Set fee on BA 11285 (booking 17825 fully paid):
  UPDATE booking_accommodations SET fee = 2008, "updatedAt" = NOW() WHERE id = 11285;

Step 2 — Deactivate 5 stale BAs:
  UPDATE booking_accommodations SET active = false, "updatedAt" = NOW()
    WHERE id IN (11239, 11168, 11285, 11352, 11179);
  (Run Step 1 first so fee is set before deactivation)

Verify:
  SELECT id, "startDate", "endDate", fee, active FROM booking_accommodations
    WHERE id IN (11239, 11168, 11285, 11352, 11179);
  Expect: all active=false; id 11285 fee=2008.

Risk: bookings/accomm | Reversible: yes | Blast radius: 5 BAs, 1 fee update
Status: Aug 30 = 9 days. Fix NOT RUN.
Last checked: 2026-08-21 Fri evening (60th check)
