# Issue 45 Addendum 22 Jul 2026 h

Reporter: AC | Area: Renewal/Class | Sheet row: 47
Last checked: Wed 22 Jul 2026 UTC (47th hourly, 76th total)

## Status
UNCHANGED from addendum -g. All 0-CA booking courses confirmed via fresh DB query.

## LAST CHANCE — ends Fri 24 Jul 2026 (TOMORROW)
- BC24828 Martina Tartaro (booking 18036): 12-week Morning General Plus + IELTS, started 5 May, ends 24 Jul — zero class assignments — 2 school days left
- BC25011 Eduardo Roche Diaz (booking 18233): General English PM, started 20 Jul, ends 24 Jul — zero class assignments — 2 school days left

## Other 0-CA booking courses (still unassigned)
- BC24945 Sarah Venturini Talizin (booking 18169): General English AM, 6 Jul to 31 Jul — 0 CAs — 16 school days missed — 7 remaining
- BC24998 Allison Guadalupe Ayala Vazquez (booking 18221): General English PM, 13 Jul to 31 Jul — 0 CAs — 9 school days missed — 7 remaining
- BC24990 Samuele Stenico (booking 18213): General English AM, 13 Jul to 7 Aug — 0 CAs — 9 school days missed — 16 remaining
- BC24609 Xuezhen Huang: tracked via issue 39 (6 days left, ends 31 Jul)
- BC24991 Edith Nunes: tracked via issue 22 (11 days left, ends 7 Aug)

## Anomaly — Gustavo Da Silva booking 18179
Two overlapping active booking courses, identical dates, zero class assignments:
- BC24955: General English AM Plus, 6 Jul to 7 Aug 2026, active=true, CAs=0
- BC24967: General English AM, 6 Jul to 7 Aug 2026, active=true, CAs=0
One is a data entry error. Confirm which to keep; deactivate the other.

## Fix Recipe (NOT YET RUN)
1. TODAY/TOMORROW: Assign BC24828 (Martina) + BC25011 (Eduardo) to classes — last chance before Fri 24 Jul
2. This week: Assign BC24945 (Sarah), BC24998 (Allison), BC24990 (Samuele) to classes
3. Gustavo: confirm BC24955 AM Plus vs BC24967 AM, deactivate wrong one, then assign
   NOT YET RUN: UPDATE booking_course SET active=false WHERE id=<wrong_bc_id>
4. Pre-assign upcoming: BC24987, BC25008, BC24983, BC88 (start 27 Jul / 3 Aug)

## Risk
bookings, class assignment — reversible — blast radius: individual student attendance

## Last checked: Wed 22 Jul 2026 UTC — UNCHANGED
