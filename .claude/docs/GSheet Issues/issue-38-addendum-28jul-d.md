# Issue 38 - August Bank Holiday Addendum 28 Jul 2026 run d

Reporter: PG | Sheet row: 40 | 143rd check Tue 28 Jul 2026 UTC

## Root cause

August Bank Holiday Mon 3 Aug 2026 STILL absent from school_closure (9 entries: Good Fridays 2026-2030, Christmas 2026-2029).

BC count INCREASED: 19 BCs start Aug 3 (was 17 at 142nd check today). Two new bookings created Tue 28 Jul:
  BC 25028 | Booking 18249 | Edgar Gilabert Mata (s.14615) | Intensive General English | Aug 3-28 | PENDING | EUR 2275 open
  BC 25029 | Booking 18250 | Monica Breier Fiametti (s.979) | Academic Year Morning | Aug 3-Nov 13 | PENDING | EUR 450 open

Potential duplicate on booking 18225 (Aleix Cervera Gonzalez):
  BC 25002: General English AM, Aug 3-Sep 18, fee EUR 259.20
  BC 25003: General English AM, Aug 3-Sep 18, fee EUR 688.00
Same name and dates on same booking; fee split may be intentional (holiday adjust or reg split). Verify before shunting.

## Fix recipe (NOT YET RUN)

Step 1 - Add August Bank Holiday to school_closure table.
Step 2 - Shunt all 19 BCs (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25003,25010,25016,25028,25029) from Aug 3 to Aug 4.
Step 3 - Verify BC 25002+25003 duplicate on booking 18225 with Neil before shunting.

See issue-38-addendum-28jul-c.md for full SQL / shunt commands.

Risk: bookings | 19 BCs 17+ students | Reversible yes | DEADLINE Fri 31 Jul 2026

Status: Open. Fix NOT RUN.