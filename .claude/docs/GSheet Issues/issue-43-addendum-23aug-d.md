Issue 43 — Jesus Manuel Ramirez Diaz / Bed 83 Stale BA (same bed as Issue 37)
Reporter: KC | Area: Booking / Accomm | Sheet row 45

Root cause (474th run, 23 Aug 2026 UTC)
No change since 472nd run. Confirmed from fresh DB:
- BA 11285 (booking 17825, Jesus Manuel Ramirez Diaz, student 14439): bed 83, 21 Jun – 5 Jul 2026, active = true, fee = null — 49 days stale
- One of 5 stale BAs on bed 83 (see issue-37-addendum-23aug-e.md for full list)
- BA 25 (Rosa Maria Mollica) starts bed 83 on 30 Aug — 7 DAYS
- BA 11285 fee = null (possible gratis stay or missing data entry)

Fix recipe (NOT YET RUN)
Covered by Issue 37 fix:
  UPDATE booking_accommodations SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: bed 83 allocation only
- DEADLINE: before 30 Aug 2026 (7 days)

Status: FIX NOT RUN
Last checked: 2026-08-23 UTC (474th run)