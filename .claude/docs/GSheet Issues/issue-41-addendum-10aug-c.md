Issue 41 — Giampaolo Russo Apartment Bed Unassigned (Addendum 10 Aug 2026, run c)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Root Cause (42nd check, Mon 10 Aug 2026 UTC):
- Student 14571 (Giampaolo Russo), Booking 18180
- Booking Accommodation 11392: City Centre Apartment, Premium, 2026-09-06 to 2026-09-14
- bed_id = null — no bed assigned. 27 days until check-in.
- Host family (BA 11357, bed 178, Aug 2 to Sep 6): correctly assigned

AVAILABLE BEDS — Capel Street (provider 15), Premium, for Sep 6-14:
  Bed 168 (A1 / Room 1 / Bed A, Premium) — FREE (both beds in room free = private room)
  Bed 174 (A1 / Room 1 / Bed B, Premium) — FREE (same room as 168)
  Bed 175 (A1 / Room 2 / Bed B, Premium) — FREE but bed 83 in same room occupied Aug 30 to Oct 11
  Bed 176 (A2 / Room 1 / Bed B, Premium) — FREE but bed 161 in same room occupied Aug 30 to Oct 25

RECOMMENDATION: Assign Bed 168 (A1/Room1/Bed A) — both beds in that room free Sep 6-14,
giving Giampaolo a private premium room for his 1-week stay.

FIX RECIPE — NOT YET RUN
Option A — SIS admin: open Booking Accommodation 11392 -> set bed = 168
Option B — SQL (NOT YET RUN):
  UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392;

Risk: bookings. Reversible. Blast radius = 1 accommodation record.
Status: Open — 27 days to Sep 6 check-in. Bed 168 confirmed free.
Last checked: Mon 10 Aug 2026 UTC (42nd check)