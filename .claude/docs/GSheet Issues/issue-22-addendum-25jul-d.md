# Issue 22 — Edite Nunes: No Class Assignment (Addendum 25 Jul 2026 D)

Reporter: Staff | Area: Booking / Class | Sheet row: 23 | Check: 85th hourly, 167th total

STATUS: CRITICAL — 10 school days missed, 9 remaining (ends Fri 7 Aug). Blocked by Issue 38.

CURRENT DATA (fresh query Sat 25 Jul UTC):
- BC 24991 (General English AM, booking 18214, student 1015): active = true
  Start: 2026-07-13 | End: 2026-08-07
- Student class assignments: 0 (unchanged since Jul 13)
- School days missed: 10 (weeks 13-18 Jul, 21-25 Jul)
- School days remaining: 9 (Mon 27-31 Jul: 5 + Tue 4-7 Aug: 4; Aug 3 BH excluded)
- Blocked by Issue 38: Aug BH must be added to school_closures first

FIX ORDER (NOT YET RUN):
Step 1 — Fix Issue 38 (add Aug BH 2026-08-03 to school_closures)
Step 2 — SIS admin: Bookings > 18214 (Edite Nunes) > Courses > BC 24991 > Assign to Class
  Class: General English AM | Effective from: 2026-07-27 (Mon)
  Creates 9 student class assignments: Mon 27 Jul - Fri 7 Aug 2026 (excl Aug 3 BH)

Risk: class assignment | Reversible: Yes | Single student
Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (85th hourly, 167th total)