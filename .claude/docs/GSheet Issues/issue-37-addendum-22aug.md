# Issue 37 Addendum 22 Aug 2026 — Verónica Martín, bed 83 stale BAs

Reporter: AC | Area: Booking / Accomm | Sheet row: 39

Root cause (446th check, Sat 22 Aug 2026 UTC — no change since check 63 Fri 21 Aug ~12:00 UTC):

5 stale active Booking Accommodations on bed 83:
  - BA 11239 (ended 24 May, 90 days stale, fee EUR 1,050, booking 22)
  - BA 11168 (ended 20 Jun, 63 days stale, fee EUR 700, booking 92)
  - BA 11285 (ended 5 Jul, 48 days stale, fee = null, booking 17825)
  - BA 11352 (ended 11 Jul, 42 days stale, fee EUR 360, booking 18156)
  - BA 11179 (ended 9 Aug, 13 days stale, fee EUR 1,360, booking 82)

Booking 17825 (BA 11285): CONFIRMED, amountTotal = EUR 2,008, amountOpen = 0 — fee not set.

Upcoming bed 83 events:
  - Current occupant: BA 11173 (booking 88), active, ends 30 Aug — 8 days away.
  - Next occupant: BA 25 (booking 17844), starts 30 Aug — fix stale records before then.

Fix recipe (NOT YET RUN):
  UPDATE booking_accommodations SET fee = 2008, updated_at = NOW() WHERE id = 11285;
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
    WHERE id IN (11239, 11168, 11285, 11352, 11179);
  (Do NOT touch BA 11173 — current occupant until 30 Aug.)

Verify:
  SELECT id, bed_id, end_date, fee, active FROM booking_accommodations
  WHERE id IN (11239, 11168, 11285, 11352, 11179);
  Expect: all active=false; 11285 fee=2008.

Risk: bookings/data-hygiene | Reversible: yes | Blast radius: bed 83 stale records only.
Status: OPEN, fix NOT RUN. Run before 30 Aug.
Last checked: 2026-08-22 Sat UTC (446th check)
