Issue 24 — Alberto Squillace (37th check, 17th today)
Reporter: PG | Area: Booking / Class | Sheet row: 25

Symptom: Migration problem — Fidelo holiday not reflected in SIS; two courses created instead of holiday split.

Root cause (Sun 2 Aug 2026 UTC, student returns TOMORROW Tue 4 Aug):
- Student 1052 (Alberto Squillace), booking 1611
- BC 24686 (Morning General, Jul20-Sep18): active, 0 class assignments — 13 days since BC start with no assignment
- No booking_holiday in SIS for booking 1611 (holiday was Fidelo-only, never migrated)
- BC 24686 start = Jul20 — NOT in Aug3 BH shunt list (pre-dates Aug3); shunt does not affect this student
- BC 1797 (Morning General, Apr6-Jun26): still active, 37 days stale, 1 class assignment (migration artifact only)
- Class assignment urgently needed on BC 24686 for week starting Tue 4 Aug
  (BH is Mon Aug3 so first school day back = Tue Aug4)

Fix recipe (NOT YET RUN):

Step 1 — Deactivate stale BC 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 2 — Set fee on BC 24686 if null:
  SELECT fee FROM booking_courses WHERE id = 24686;
  If null: UPDATE booking_courses SET fee = [correct fee from HubSpot deal] WHERE id = 24686;

Step 3 — Create class assignment on BC 24686 for week starting Tue 4 Aug:
  Via SIS admin: Classes > Assign > Alberto Squillace > week starting Tue 4 Aug 2026
  (Class to confirm from teacher/timetable — likely Morning General class)

Risk/category: Bookings + Classes; low blast radius (1 student). Reversible. Returns TOMORROW.
Status: NOT RUN — 37th check, 17th today Sun 2 Aug 2026 UTC