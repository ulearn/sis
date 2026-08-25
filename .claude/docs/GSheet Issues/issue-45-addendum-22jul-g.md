# Issue 45 Addendum 22 Jul 2026 g

Reporter: AC | Area: Renewal/Class | Sheet row: 47
Last checked: Wed 22 Jul 2026 UTC (46th hourly, 75th total)

## Symptom
Returning students not on arrivals list; expanded to confirmed BCs with 0 class assignments.

## Root Cause

LAST CHANCE - ends Fri 24 Jul (2 school days left):
- BC24828 Martina Tartaro (bk18036): 12-week Morning General Plus + IELTS, ends 24 Jul, 0 CAs
- BC25011 Eduardo Roche Diaz (bk18233): General English PM, ends 24 Jul, 0 CAs

NEW FINDINGS - 6 additional BCs with 0 CAs discovered this run:
- BC24945 Sarah Venturini Talizin (bk18169): General English AM, started 6 Jul, ends 31 Jul, 16d missed, 7 left
- BC24998 Allison Guadalupe Ayala Vazquez (bk18221): General English PM, started 13 Jul, ends 31 Jul, 9d missed, 7 left
- BC24990 Samuele Stenico (bk18213): General English AM, started 13 Jul, ends 7 Aug, 9d missed, 16 left

ANOMALY - Gustavo Da Silva (booking 18179) has two overlapping BCs:
- BC24955: General English AM Plus, 6 Jul to 7 Aug 2026, active, 0 CAs
- BC24967: General English AM, 6 Jul to 7 Aug 2026, active, 0 CAs
Same student, same dates. One is a data entry error.

Future BCs needing pre-assignment:
- BC24987 Nezha Soulimani (bk18210): starts 27 Jul, ends 31 Jul
- BC25008 Roberta Capitini (bk18230): starts 27 Jul, ends 31 Jul
- BC24983 Erin Pastorelli (bk18206): starts 27 Jul, ends 7 Aug
- BC88 Africa Mera Bachir (bk82): starts 3 Aug, ends 7 Aug

Previously tracked still 0 CAs: BC24609 Xuezhen (6d left, issue 39), BC24991 Edith (12d left, issue 22)

## Fix Recipe (NOT YET RUN)
1. URGENT by Thu 23 Jul: Assign BC24828 + BC25011 to classes in SIS
2. URGENT this week: Assign BC24945 (Sarah), BC24998 (Allison), BC24990 (Samuele) to classes
3. INVESTIGATE Gustavo booking 18179: confirm which BC is correct (BC24955 or BC24967),
   deactivate the other (NOT YET RUN: UPDATE booking_course SET active=false WHERE id=<wrong>)
   then assign the remaining one to a class.
4. Pre-assign future BCs before start: BC24987, BC25008, BC24983, BC88

## Risk
- Category: bookings, class assignment
- Reversible: Yes
- Urgency: CRITICAL for BC24828+BC25011 (end Fri 24 Jul); HIGH for new BCs; ANOMALY Gustavo

## Status
Open. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC