Issue 37 — Veronica Martin: Stale Booking Accommodations 11285 + 11352
15th check Wed 5 Aug 2026 UTC
Reporter: pg | Area: Booking/Accommodation | Sheet row: 39

Symptom
Two expired booking accommodations remain active on bed 83, blocking accommodation management view.

Root Cause (verified 2026-08-05, 15th check — UNCHANGED)
- Booking accommodation 11352 (Veronica Martin, student 278, booking 18156): ended 2026-07-11, active = true — 25 days stale, fee EUR 360.
- Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, booking 17825): ended 2026-07-05, active = true — 31 days stale, fee = null.
- Bed 83 currently occupied by other students — these stale BAs are cosmetic only.

Fix Recipe (NOT YET RUN)

Step 1 — Deactivate stale booking accommodations:
  UPDATE "BookingAccommodation" SET active = false, updated_at = NOW() WHERE id IN (11285, 11352);

Step 2 — Verify:
  SELECT id, active, end_date FROM "BookingAccommodation" WHERE id IN (11285, 11352);

Risk / Category
accommodations | Reversible: yes | Cosmetic only (bed 83 occupied, no functional impact)

Status: NOT YET RUN | Last checked: 2026-08-05 UTC (15th check)
BAs 11352+11285 stale 25d/31d.