ISSUE 6 -- Erroneous Mobile Numbers (all students)
Reporter: PG | Area: Overview | Sheet row 7

SYMPTOM
553 student phone_mobile values are non-null but not in E.164 format (not starting with +).

STATUS (68th check, Sun 23 Aug 2026 UTC)
- Total students: 14,478 (unchanged)
- Malformatted phones (not null, not starting with +): 553 (UNCHANGED from 67th check)
- Good format (starting with +): 829 (unchanged)
- Null phones: 13,096 (historical/inactive students)
- Day 52 without fix

FIX RECIPE (NOT YET RUN)
See: issue-6-phone-cleanup.md for full normalisation recipe.
Short summary: normalise 553 phones to E.164 (add country code, strip spaces/dashes).
Requires manual review of sample records to determine correct country codes for ambiguous numbers.

STATUS: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (68th hourly run)
