Issue 38 Addendum 22 Jul 2026 - August + October Bank Holidays Still Absent

Sheet row: 40 | Check: 40th hourly Wed 22 Jul 2026 UTC

Root cause (fresh DB):
- School closure table: 9 records - Good Fridays 2026-2030 and Christmas 2026-2029. Zero bank holidays.
- August Bank Holiday Mon 3 Aug 2026: STILL ABSENT - 12 days away.
- October Bank Holiday Mon 26 Oct 2026: STILL ABSENT.
- Approximately 202 booking courses affected by Aug BH; 114 by Oct BH.

Fix recipe (NOT YET RUN):
1. SIS admin > School Closures > Add new
2. Name: August Bank Holiday 2026 | Start: 2026-08-03 | End: 2026-08-03
3. Name: October Bank Holiday 2026 | Start: 2026-10-26 | End: 2026-10-26
4. After adding, trigger recalculation of affected booking course end dates (~202 + ~114 courses).
   Each affected BC end date shifts +1 school day if it lands on or after the BH.

Risk: Bookings/dates. Partially reversible (closures deletable; date recompute is one-way without snapshot).
Blast radius: ~202 booking courses for Aug BH. 12 days until Aug 3.

Status: OPEN - Fix NOT RUN
Last checked: Wed 22 Jul 2026 UTC