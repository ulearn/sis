# Issue 24 - Alberto Squillace (83rd check)
Reporter: AC | Area: Booking/Class | Sheet row: 25 | Tue 18 Aug 2026 UTC

Symptom: Migration problem - student had Fidelo holidays, no class assigned in SIS.

Root Cause (83rd check - 18 Aug 2026 UTC):
- BC 24686 (Morning General, booking 1611): 20 Jul to 18 Sep 2026, active, 0 SCAs - 29 days elapsed, 31 days remaining
- BC 1797 (Morning General): ended 26 Jun 2026 - 53 days stale, active, 1 historical SCA (class 12, week-end Apr 26)
- Booking 1611: CONFIRMED, fully paid EUR 1,280.12, amountOpen=EUR 0
- No change from 82nd check (Mon 17 Aug). 29d elapsed (+1).

Fix Recipe (NOT YET RUN):
1. Assign class to BC 24686 via SIS class assignment screen
2. Deactivate BC 1797: UPDATE booking_course SET active=false WHERE id=1797

Risk: Bookings | Reversible | Moderate - student in class period, SCA missing from record
Status: Open - fix NOT RUN | Last checked: Tue 18 Aug 2026 UTC
