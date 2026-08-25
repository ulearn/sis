# Issue 39 — Xuezhen Huang: No Class Assignment (Addendum 25 Jul 2026 B)

Reporter: Staff | Area: Booking / Class | Sheet row: 41 | Check: 85th hourly, 163rd total

STATUS: CRITICAL — Final week starts Mon 27 Jul (2 days). 5 school days left.

CURRENT DATA (fresh query Sat 25 Jul UTC):
- Booking course BC 24609 (Morning General, booking 17831, student 14443): active = true
- Start: 2026-07-13 | End: 2026-07-31
- Student class assignments on BC 24609: 0 (confirmed)
- School days already missed: 10 (weeks 13-18 Jul and 21-25 Jul)
- School days remaining: 5 (Mon 27 - Fri 31 Jul)
- NOT blocked by Issue 38 (course ends before Aug 3)
- Accommodation BA 11357 (Host Family, bed 180, 12 Jul - 2 Aug 2026): active = true
- Payment: fully settled EUR 1,396.90

FIX RECIPE (NOT YET RUN):

Assign BC 24609 to Morning General class from Mon 27 Jul:
  In SIS admin: Bookings > 17831 (Xuezhen Huang) > Courses > BC 24609 > Assign to Class
  Class: Morning General (appropriate level)
  Effective from: Mon 27 Jul 2026
  This creates SCAs for Mon 27 - Fri 31 Jul 2026 (5 days)

URGENCY: If not done today (Sat), student loses entire final week.

RISK: Class assignment — 10 days missed, 5 remain | Reversible: Yes | Single student

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (85th hourly, 163rd total)
