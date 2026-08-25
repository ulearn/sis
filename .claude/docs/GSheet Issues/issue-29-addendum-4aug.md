# Issue 29 & 15 — Saikhantes Shagdarsuren — SCA Due Aug 24 (addendum 4 Aug 2026)
Reporter: (legacy) | Area: Bookings | Sheet row: 30

## Symptom
Duplicate of Issue 15 (row 16). Student on holiday, returns Mon 24 Aug — SCA gap will open.

## Root cause
2nd check this week (Tue 4 Aug 2026 UTC). Student on holiday, returns Mon 24 Aug 2026 (20 days).

- Student 1001 (Saikhantes Shagdarsuren)
- Booking course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): live course, booking 18151
- SCA 255: class 11 (B1 PM), week_end = 2026-07-03 — expired 32 days ago, no new SCA
- Holiday 2500: 2026-07-20 to 2026-08-21 — currently on holiday (17 days remaining)
- Booking course 1982 (Academic Year Morning, ended 2025-12-19): active = true — 228 days stale
## Fix recipe (NOT YET RUN)
Action window opens Mon 24 Aug 2026 (student return day).

1. Create new SCA on BC 24925 when student returns (tracked in Issue 15):
   class: 11 (B1 PM), booking_course_id: 24925
   week_end: 2026-08-28 (first Friday after return Mon 24 Aug)

2. Deactivate stale BC 1982:
   UPDATE booking_course SET active = false WHERE id = 1982;
## Risk / category
bookings | data-hygiene. Reversible. Blast radius: 1 student. SCA time-sensitive (due Aug 24).
## Status
Open — student on holiday until 21 Aug, returns 24 Aug. BC 1982 228d stale. Fix NOT RUN.
## Last checked (UTC)
Tue 4 Aug 2026