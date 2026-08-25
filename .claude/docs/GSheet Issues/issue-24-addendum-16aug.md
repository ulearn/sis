# Issue 24 - Alberto Squillace (81st check)
Reporter: AC | Area: Booking/Class | Sheet row: 25 | Sun 16 Aug 2026 UTC

Symptom: Migration problem - student had Fidelo holidays, no class assigned in SIS.

Root Cause (81st check - 16 Aug 2026 UTC):
- BC 24686 (Morning General, booking 1611): 20 Jul to 18 Sep 2026, active, 0 SCAs - 27 school days elapsed, 33 remain
- BC 1797 (Morning General): ended 26 Jun 2026 - 51 days stale, active, 1 historical SCA
- Booking 1611: CONFIRMED, fully paid EUR 1,280.12
- No change from 80th check (Sat 15 Aug). 27d elapsed (+1).

Fix Recipe (NOT YET RUN):
1. Assign class to BC 24686 via SIS class assignment screen
2. Deactivate BC 1797: UPDATE BookingCourse SET active=false WHERE id=1797

Risk: Bookings | Reversible | Moderate - student in class, SCA missing from record
Status: Open - fix NOT RUN | Last checked: Sun 16 Aug 2026 UTC
