# Issue 22 — Edite Nunes / Edith (addendum Fri 24 Jul 2026 UTC, 160th total / 79th hourly)

- Reporter: PG | Area: Booking / Class | Sheet row 23
- Student: Edite Nunes (Edith in SIS, student 1015) | Booking 18214

## Symptom (verbatim col G)
Not appearing in tba for wb 18.05.26 - two payments with same invoice number?

## Root Cause (live data, 24 Jul 2026 UTC)
- Booking 18214: Confirmed, confirmed = true, fully paid EUR 608.
- Booking course BC 24991 (General English AM, Jul 13 – Fri 7 Aug 2026): still 0 class assignments.
- 10 school days already missed (Jul 13 to Jul 24).
- Depends on Issue 38 (Aug BH closure) being inserted before class assignment.

## CORRECTION — day-of-week error in prior H-cell updates
Previous H cell stated: "Mon 28, Tue 29, Wed 30, Thu 31 Jul" — these weekday assignments are WRONG.

Verified via node Date UTC for 2026-07:
- 27 Jul = Monday
- 28 Jul = Tuesday
- 29 Jul = Wednesday
- 30 Jul = Thursday
- 31 Jul = Friday
- 3 Aug = Monday (Bank Holiday — closed)
- 4 Aug = Tuesday
- 5 Aug = Wednesday
- 6 Aug = Thursday
- 7 Aug = Friday (course end)

Correct remaining school days (from today Fri 24 Jul, assuming Aug BH inserted):
- Today Fri 24 Jul (if assigned today)
- Mon 27, Tue 28, Wed 29, Thu 30, Fri 31 Jul
- Mon 3 Aug = Bank Holiday (closed)
- Tue 4, Wed 5, Thu 6, Fri 7 Aug

= 9 school days from Monday; 10 including today. (Course end Fri 7 Aug.)

## Fix Recipe (NOT YET RUN)

### PREREQUISITE: Fix Issue 38 first
Insert August Bank Holiday (2026-08-03) into school_closures before assigning BC 24991.

### Step 1 — Assign BC 24991 to General English AM class
In SIS admin: student Edith Nunes (1015) > Booking 18214 > BC 24991 (General English AM).
Assign to General English AM class from Mon 27 Jul (or today Fri 24 Jul if before cutoff).
Student level: A2. Course ends Fri 7 Aug 2026.

## Risk / Category
- Bookings / academic. No blast radius; reversible.
- Blocked by Issue 38.

## Status
BC 24991: 0 SCAs — UNRESOLVED. Depends on Issue 38 (Aug BH). 10 days missed, ~9 days remain. Day-of-week error corrected this run.

## Last checked
Fri 24 Jul 2026 UTC (160th total check, 79th hourly on issue 22)
