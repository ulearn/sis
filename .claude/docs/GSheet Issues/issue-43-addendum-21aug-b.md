# Issue 43 addendum 21 Aug check 55
Reporter: AC | Sheet row 45 | Student: Jesús Manuel Ramírez Díaz (14439), bed 83

Current state verified Fri 21 Aug 2026 ~12:00 UTC:
- Same 5 stale active BAs on bed 83 as Issue 37 (same bed):
  - BA 11239: ended 24 May (89d stale), booking 22
  - BA 11168: ended 20 Jun (62d stale), booking 92
  - BA 11285: ended 5 Jul (47d stale), fee=NULL, booking 17825
  - BA 11352: ended 11 Jul (41d stale), booking 18156
  - BA 11179: ended 9 Aug (12d stale), booking 82
- Current occupant BA 11173 (booking 88): active, ends 30 Aug (9 days)
- Next occupant BA 25 (booking 17844): starts 30 Aug — 9 days away
- No change since check 54 (11:02 UTC). Fix identical to Issue 37.

Fix recipe (NOT YET RUN): see issue-37-addendum-21aug-b.md (same bed 83, same fix).
  UPDATE booking_accommodation SET fee = 2008 WHERE id = 11285;
  UPDATE booking_accommodation SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Risk: Bookings/data-hygiene. Reversible. Blast radius: bed 83 stale records only.
Status: OPEN, Fix NOT RUN. Last checked: 2026-08-21 12:00 UTC (check 55)