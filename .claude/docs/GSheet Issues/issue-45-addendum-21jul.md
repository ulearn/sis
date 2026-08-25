# Issue 45 — Renewal Students (4 unassigned BCs) — Addendum 21 Jul 2026

Reporter: AC | Area: Renewal students | Sheet row: 47

## Root cause (50th check, Tue 21 Jul 2026 UTC)

All 4 booking courses still have 0 class assignments:

BC25011 — Eduardo Roche Diaz (General English PM, 20 Jul - 24 Jul 2026):
- Booking 18233, fee = EUR 120, active = true
- DAY 2 of 5-day course — 3 school days remaining (ends FRIDAY 24 Jul)

BC24945 — Sarah Venturini Talizin (General English AM, 6 Jul - 31 Jul 2026):
- Booking 18169, fee = EUR 561, active = true
- 12 school days missed (Jul 6-17 + Jul 20), 8 remaining

BC24998 — Allison Guadalupe Ayala Vazquez (General English PM, 13 Jul - 31 Jul 2026):
- Booking 18221, fee = EUR 360, active = true
- 7 school days missed (Jul 13-17 + Jul 20), 8 remaining

BC24990 — Samuele Stenico (General English AM, 13 Jul - 7 Aug 2026):
- Booking 18213, fee = EUR 608, active = true
- 7 school days missed (Jul 13-17 + Jul 20), 12 remaining

## Fix recipe (NOT YET RUN — in priority order)

1. URGENT: Assign Eduardo (BC25011) to GE PM class:
   SIS -> Student -> Booking 18233 -> BC25011 -> Assign Class

2. Assign Sarah (BC24945) to GE AM class:
   SIS -> Student -> Booking 18169 -> BC24945 -> Assign Class

3. Assign Allison (BC24998) to GE PM class:
   SIS -> Student -> Booking 18221 -> BC24998 -> Assign Class

4. Assign Samuele (BC24990) to GE AM class:
   SIS -> Student -> Booking 18213 -> BC24990 -> Assign Class

## Risk
bookings / class assignment — low blast radius, reversible.
CRITICAL — Eduardo ends Friday; Sarah 12d missed.

Open — Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC