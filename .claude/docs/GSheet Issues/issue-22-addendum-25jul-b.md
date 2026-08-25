# Issue 22 — Edite Nunes: No Class Assignment (Addendum 25 Jul 2026 B)

Reporter: Staff | Area: Booking / Class | Sheet row: 23 | Check: 82nd hourly, 163rd total

STATUS: CRITICAL — 10 days missed, 9 remain. Blocked by Issue 38 (Aug BH).

CURRENT DATA (fresh query Sat 25 Jul UTC):
- Booking course BC 24991 (booking 18214, student 1015 Edite Nunes): active = true
- End date: Fri 7 Aug 2026
- Student class assignments on BC 24991: 0 (confirmed by fresh query)
- School days missed: 10 (weeks 13-18 Jul and 21-25 Jul)
- School days remaining: 9 — Mon 27-Fri 31 Jul (5) + Tue 4-Fri 7 Aug (4, assuming Aug BH added)
- BLOCKED: must add Aug BH closure (Issue 38) before assigning, else SCA spans bank holiday

FIX RECIPE (NOT YET RUN):

Step 1 — Fix Issue 38 first (insert Aug BH 2026-08-03 in school_closures).

Step 2 — Assign BC 24991 to General English AM from Mon 27 Jul:
  In SIS admin: Bookings > 18214 (Edite Nunes) > Courses > BC 24991 > Assign to Class
  Class: General English AM
  Effective from: Mon 27 Jul 2026
  System should skip Aug 3 automatically once Issue 38 fixed
  Assignment spans Mon 27 Jul - Fri 7 Aug 2026 (9 school days, skipping Mon 3 Aug)

RISK: Class assignment | Reversible: Yes | Single student | 10 days already missed

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (82nd hourly, 163rd total)
