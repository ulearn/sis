# Issue 22 — Edith Nunes — Addendum 21 Jul 2026

Reporter: PG | Area: Booking / Class | Sheet row: 23

## Root cause (45th check, Tue 21 Jul 2026 UTC)

BC24991 (General English AM, 13 Jul to 7 Aug 2026):
- student 1015, booking 18214, fee = EUR 608, active = true
- classAssignments = 0
- Week 2 day 2: 6 school days missed (Jul 13-17 + Jul 20), 12 remaining

Stale booking courses:
- BC24933 (GE AM, Jun 15 to Jul 10): active = true — 11 days stale
- BC24934 (GE AM, Jun 15 to Jul 10): active = true — 11 days stale

## Fix recipe (NOT YET RUN)

1. Assign Edith to GE AM class:
   SIS -> Student 1015 -> Booking 18214 -> BC24991 -> Assign Class

2. Deactivate stale booking courses:
   UPDATE BookingCourse SET active = false WHERE id IN (24933, 24934);

## Risk
bookings / class assignment — low blast radius, reversible.
CRITICAL — 6 days missed; 12 remaining.

Open — Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC