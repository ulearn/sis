# Issue 22 — Edite Nunes (check Fri 24 Jul 2026 UTC, 73rd hourly, 153rd total)

Reporter: staff. Area: Booking / Class. Sheet row 23.

## Symptom
Not appearing in class assignment list; two payments with same invoice number.

## Root Cause
- Booking course 24991 (General English AM, booking 18214): active = true — STILL zero class assignments
- Booking 18214: CONFIRMED, EUR 608 / 608 fully paid, confirmed = true — no payment blocker
- School days missed: Mon 13 Jul to Fri 24 Jul 2026 = 10 school days
- School days remaining: Mon 27 Jul to Fri 7 Aug 2026 = 10 school days (9 if Aug Bank Holiday 3 Aug added)
- DEPENDENCY: resolve Issue 38 (add Aug Bank Holiday) before or alongside this fix
- Status UNCHANGED — 73rd hourly check, fix still NOT RUN

## Fix Recipe (NOT YET RUN)
1. Resolve Issue 38 first: add August Bank Holiday (Mon 3 Aug 2026) to school_closures
2. In SIS admin, navigate to Booking 18214 (student Edite Nunes)
3. Open Booking Course 24991 (General English AM, 13 Jul to 7 Aug)
4. Create Student Class Assignment (SCA) for BC 24991:
   - Class: appropriate General English AM class
   - Start: Mon 27 Jul 2026
   - End: Fri 7 Aug 2026
   - Note: Mon 3 Aug is August Bank Holiday (school closure) — SCA spans the closure, no class that day
5. Verify the student appears in class roster for wb 27 Jul

## Risk / Category
- Category: bookings / class assignment
- Reversible: yes
- Blast radius: student only
- URGENCY: CRITICAL — 10 school days missed, only 9-10 remaining. Must assign before Mon 27 Jul.

## Status
Fix NOT RUN as of Fri 24 Jul 2026 UTC (153rd total check, 73rd hourly). Course ends Fri 7 Aug 2026.