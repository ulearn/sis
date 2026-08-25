# Issue 39 — Xuezhen Huang (addendum Fri 24 Jul 2026 UTC, 160th total / 82nd hourly)

- Reporter: KC | Area: Booking / Accomm / Class | Sheet row 41
- Student: Xuezhen Huang (ID 14443, nickname Hazel) | Booking 17831

## Symptom (verbatim col G)
The student paid for 3 weeks accommodation in Host Family, but it does not appear in SIS.
From 12/07/2026 to 02/08/2026

## Root Cause (live data, 24 Jul 2026 UTC)
- Accommodation BA 11358 (Host Family, Individual, Full Board, Jul 12 to Aug 2, bed 180): active = true. Original accomm issue IS resolved.
- Booking course BC 24609 (Morning General, B2, Jul 13 to Fri 31 Jul 2026): still 0 class assignments (verified).
- Payment fully settled: EUR 1,396.90 paid, open = 0.

## CRITICAL CORRECTION — day-of-week error in all prior H-cell updates (runs 1-81)
Previous H cells stated: "Course ends Thu 31 Jul" and "Fri 25 Jul (TOMORROW) last 5-day chance" — BOTH ARE WRONG.

Verified via node Date UTC:
- 24 Jul 2026 = Friday (today)
- 25 Jul 2026 = Saturday (not a school day)
- 27 Jul 2026 = Monday (first school day of final week)
- 31 Jul 2026 = Friday (course end date — not Thursday)

Correct remaining school days from today (Fri 24 Jul):
- Today Fri 24 Jul (if assigned before afternoon cutoff)
- Mon 27 Jul
- Tue 28 Jul
- Wed 29 Jul
- Thu 30 Jul
- Fri 31 Jul (final day, course ends)

= 5 school days from Monday; 6 including today.
NOT blocked by Issue 38 (Aug BH): BC 24609 ends 31 Jul, before Aug 3.

## Fix Recipe (NOT YET RUN)

### Step 1 — Assign BC 24609 to Morning General B2 class
In SIS admin: student Xuezhen Huang (14443) > Booking 17831 > BC 24609 (Morning General, B2).
Assign to Morning General B2 class starting Mon 27 Jul (or today Fri 24 Jul if cutoff permits).
Student has 5 school days Mon-Fri 27-31 Jul.

### Step 2 — No accommodation action needed
BA 11358 (bed 180, Jul 12 to Aug 2) is active and assigned. Original issue is resolved.

## Risk / Category
- Bookings / academic. No blast radius; reversible.
- No dependency on Issue 38.

## Status
BC 24609: 0 SCAs — UNRESOLVED. Accommodation: resolved. Day-of-week correction documented this run.

## Last checked
Fri 24 Jul 2026 UTC (160th total check, 82nd hourly on issue 39)
