# Issue 24 — Alberto Squillace / Mia Wehrli — Addendum 21 Jul 2026

Reporter: PG | Area: Booking | Sheet row: 25

## Root cause (104th check, Tue 21 Jul 2026 UTC)

BC24686 (Alberto Squillace, Morning General, 20 Jul - 18 Sep 2026):
- Booking 1611 — fee = null — day 2 in progress

BC24616 (Mia Wehrli, General English AM Plus, 20 Jul - 31 Jul 2026):
- Booking 17842 — fee = null — day 2 in progress

BC1797 (Alberto Squillace, Morning General, 6 Apr - 26 Jun 2026):
- fee = EUR 1836, active = true — 25 days stale (ended Jun 26)

## Fix recipe (NOT YET RUN)

1. Set fee on BC24686 (Alberto new course):
   SIS -> Booking 1611 -> BC24686 -> set fee (check HubSpot deal)

2. Set fee on BC24616 (Mia):
   SIS -> Booking 17842 -> BC24616 -> set fee

3. Deactivate stale BC1797:
   UPDATE BookingCourse SET active = false WHERE id = 1797;

## Risk
bookings / data-hygiene — reversible.
Check HubSpot deal amounts before setting fees.

Open — Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC