Issue 43 - Jesus Manuel Ramirez Diaz - Bed 83 Stale BA (same bed as Issue 37)
Reporter: KC | Area: Booking / Accomm | Sheet row 45 | Run: 471st, Sun 23 Aug 2026 UTC

Symptom
Accommodation dates should be Jun 20 to Jul 4; stale BA 11285 still active.

Root Cause (confirmed from live DB, 471st run)
- BA 11285 (Jesus Manuel Ramirez Diaz, bed 83): 21 Jun to 5 Jul 2026, active=true, fee=null - 49 days stale
- One of 5 stale BAs on bed 83 (see issue-37-addendum-23aug-d.md for full list)
- BA 25 (Rosa Maria Mollica) starts bed 83 on 30 Aug - 7 days
- BA 11285 fee = null (possible gratis stay or missing data entry)

Fix Recipe (NOT YET RUN)
Covered by Issue 37 fix:
  UPDATE booking_accommodations SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: bed 83 allocation only
- DEADLINE: before 30 Aug 2026 (7 days)

Status: FIX NOT RUN
Last checked: 2026-08-23 (471st run UTC)