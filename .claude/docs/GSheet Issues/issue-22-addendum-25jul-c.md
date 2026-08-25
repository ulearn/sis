# Issue 22 — Edite Nunes: No Class Assignment (Addendum 25 Jul 2026 C)

Reporter: Staff | Area: Booking / Class | Sheet row: 23 | Check: 83rd hourly, 165th total

STATUS: CRITICAL — 9 school days remain. Blocked by Issue 38 (Aug BH not in school_closures).

CURRENT DATA (fresh query Sat 25 Jul UTC afternoon):
- Booking course BC 24991 (General English AM, booking 18214, student 1015): active = true
- Start: 2026-07-13 | End: 2026-08-07
- Student class assignments: 0 (confirmed, unchanged)
- School days already missed: 10 (weeks 13-18 Jul and 21-25 Jul)
- School days remaining: 9
  Mon 27 – Fri 31 Jul (5) + Tue 4 – Fri 7 Aug (4, pending Aug 3 BH fix)

DEPENDENCY: Issue 38 must be resolved first (Aug BH added to school_closures).

No change from morning 163rd-total check — fix has NOT been run.

FIX RECIPE (NOT YET RUN):

Step 1 — Resolve Issue 38 (add Aug BH closure).

Step 2 — Assign BC 24991 to General English AM starting Mon 27 Jul:
  SIS admin: Bookings > 18214 (Edite Nunes) > Courses > BC 24991 > Assign to Class
  Class: General English AM (appropriate level)
  Effective from: 2026-07-27 (Mon)
  Creates SCAs: Mon 27 – Fri 31 Jul + Tue 4 – Fri 7 Aug (9 school days)

RISK: Class assignment | Reversible: Yes | Single student | 10 days already lost

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (83rd hourly, 165th total)
