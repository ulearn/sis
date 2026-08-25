Issue 22 -- Edith Nunes -- Addendum 21 Jul 2026 (26th hrly)

Reporter: PG | Area: Booking / Class | Sheet row: 23

Root cause (50th check, Tue 21 Jul 2026 UTC):

Booking 18214 (Edith Nunes, student 1015): CONFIRMED, EUR 608 paid.
BC24991 (General English AM, 13 Jul to 7 Aug 2026): active=true, zero class assignments.
  8 school days missed (Jul 13-17 + Jul 20-22); 12 remaining (23 Jul - 7 Aug)
  UNCHANGED from 25th hourly check

Existing SCAs -- for past booking courses only:
  SCA 48: booking course 1751 (Morning General, Mar-Apr 2026), class A1, weekEnd Apr 17
  SCA 146: booking course 24668 (Morning General, Apr-May 2026), class A1, weekEnd May 15
  No SCA exists for BC24991 or any BC starting after May 15 2026.

TBA logic note: system may treat any existing SCA as assigned regardless of BC period.
If so, Edith drops off TBA despite BC24991 being unassigned. Neil to confirm.

Stale duplicate BCs in booking 18158:
  BC24933 (General English AM, 15 Jun - 10 Jul 2026): active = still true (11 days stale)
  BC24934 (General English AM, 15 Jun - 10 Jul 2026): active = still true (11 days stale)
  Both are duplicates -- identical name, dates, booking.

Fix recipe (NOT YET RUN):
1. Assign Edith to GE AM class:
   SIS > Student 1015 > Booking 18214 > BC24991 > Assign Class
   (Historical class was A1 -- likely correct)
2. Deactivate stale duplicates:
   UPDATE booking_courses SET active = false WHERE id IN (24933, 24934);
3. Optional: check TBA logic re expired SCAs blocking display.

Risk: class assignment + data-hygiene. Both reversible.
CRITICAL -- 8 days missed; 12 remaining (ends 7 Aug).
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (26th hourly)
