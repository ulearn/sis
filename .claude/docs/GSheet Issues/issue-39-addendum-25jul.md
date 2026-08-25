Issue 39 -- Xuezhen Huang -- Addendum 25 Jul 2026 (updated run B)

Reporter: Diego | Area: Booking / Accomm | Sheet row: 41
Checked: Sat 25 Jul 2026 UTC -- 84th hourly check, 162nd total run

CURRENT STATUS -- CRITICAL: FINAL WEEK STARTS MON 27 JUL (2 DAYS); FIX NOT RUN

- Booking course BC 24609 (Morning General, booking 17831, student 14443): STILL zero class assignments
- Course dates: Mon 13 Jul - Fri 31 Jul 2026
- 10 school days already missed (weeks of 13-18 Jul and 21-25 Jul)
- 5 school days remaining: Mon 27, Tue 28, Wed 29, Thu 30, Fri 31 Jul
- Mon 27 Jul is 2 calendar days away -- FINAL WEEK STARTS MONDAY
- Accommodation BA 11358 (Host Family, bed 180, 12 Jul - 2 Aug 2026): active = true, fee EUR 900 -- unchanged
- NOT blocked by Issue 38 (Aug BH) -- course ends 31 Jul before Aug 3
- Payment: fully settled EUR 1,396.90

ROOT CAUSE

No class assignment was ever created for BC 24609. Accommodation correctly assigned.
Student exists in booking but was never placed into a class register.

FIX RECIPE (NOT YET RUN)

Step 1 -- Identify the correct Morning General class (B2 level, starting Mon 13 Jul):
  SIS admin > Classes, find Morning General B2 with capacity for week of 27 Jul.

Step 2 -- Create class assignment for BC 24609:
  SIS admin: Booking 17831 > BC 24609 > Assign Class

Step 3 -- Confirm Xuezhen Huang appears on register from Mon 27 Jul.

RISK / CATEGORY

bookings | data-hygiene | Reversible: Yes | Blast radius: 1 student

STATUS

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (run B)
WINDOW CLOSES: Fri 31 Jul 2026 (5 school days from Mon 27 Jul)