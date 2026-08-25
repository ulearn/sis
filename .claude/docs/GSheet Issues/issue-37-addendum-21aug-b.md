# Issue 37 addendum 21 Aug check 63
Reporter: AC | Sheet row 39 | Student: Verónica Martín (278), bed 83

Current state verified Fri 21 Aug 2026 ~12:00 UTC:
- 5 stale active Booking Accommodations on bed 83:
  - BA 11239: ended 24 May (89d stale), fee=1050, booking 22
  - BA 11168: ended 20 Jun (62d stale), fee=700, booking 92
  - BA 11285: ended 5 Jul (47d stale), fee=NULL, booking 17825
  - BA 11352: ended 11 Jul (41d stale), fee=360, booking 18156
  - BA 11179: ended 9 Aug (12d stale), fee=1360, booking 82
- Booking 17825 (BA 11285): CONFIRMED, amountTotal=2008, amountOpen=0 — fee not set
- Current occupant BA 11173 (booking 88): active, ends 30 Aug (9 days)
- Next occupant BA 25 (booking 17844): starts 30 Aug — 9 days away
- No change since check 62 (11:02 UTC). Fix NOT RUN.

Fix recipe (NOT YET RUN):
  UPDATE booking_accommodation SET fee = 2008 WHERE id = 11285;
  UPDATE booking_accommodation SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
  (BA 11173 is current occupant — do NOT deactivate)
  Run before Aug 30 to clear bed 83 for next occupant.

Risk: Bookings/data-hygiene. Reversible. Blast radius: bed 83 stale records only.
Status: OPEN, Fix NOT RUN. Last checked: 2026-08-21 12:00 UTC (check 63)