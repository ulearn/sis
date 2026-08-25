# Issue 6 -- Phone Number Format (57th check)

Reporter: NM | Area: Overview | Sheet row: 7 | Last checked: 2026-08-17 UTC

## Symptom
~971 students have non-E.164 phone numbers.

## Root cause (no change)
- 552 students: phone_mobile exists but does not start with +
- 419 students: phone_mobile starts with + but contains spaces or dashes
- Total affected: ~971 / 14,471 students
- Day 41 since identified -- fix NOT RUN

## Fix recipe (NOT YET RUN)
1. Back up students table.
2. Normalise no-plus numbers: strip non-digits, prepend +.
3. Normalise plus-with-spaces: remove spaces and dashes.
4. Verify ~971 rows normalised.

## Risk
Data hygiene. Low risk. Reversible.

## Status
No change. Fix pending Neil approval.
Last checked: 2026-08-17 UTC (57th check)