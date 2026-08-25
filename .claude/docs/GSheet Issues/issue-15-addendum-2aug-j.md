Issue 15 — Saikhantes Shagdasuren (21st check, 13th today)
Reporter: PG | Area: Booking / Class | Sheet row: 16

Symptom: Course dates/holidays make no sense; duplicate courses from migration.

Root cause (Sun 2 Aug 2026 UTC, student returns Mon 24 Aug):
- Student 1001 (Saikhantes Shagdarsuren), booking 18151
- Last class assignment: id 255, class 11, week_start 12 Jan 2026, week_end 3 Jul 2026 — expired 30 days ago
- Holiday 2500: Jul20-Aug21 2026 — student on holiday now (3 weeks remain)
- BC 24925 (Academic Year Afternoon, 9 Mar-2 Oct 2026): active — the current live course
- BC 1982 (Academic Year Morning, 30 Jun-19 Dec 2025): still active — 226+ days stale, 0 class assignments
- New class assignment needed: class 11, week starting Mon 24 Aug on BC 24925

Fix recipe (NOT YET RUN):

Step 1 — Deactivate stale BC 1982:
  UPDATE booking_courses SET active = false WHERE id = 1982;

Step 2 — Create class assignment on BC 24925 for week starting Mon 24 Aug:
  Via SIS admin: Classes > Assign > Saikhantes Shagdarsuren > week starting Mon 24 Aug 2026
  Class: 11 (confirmed from SCA 255)

Risk/category: Bookings + Classes; low blast radius (1 student). Reversible. Returns in 22 days.
Status: NOT RUN — 21st check, 13th today Sun 2 Aug 2026 UTC