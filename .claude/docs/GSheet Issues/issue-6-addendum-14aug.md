Issue 6 - Erroneous Mobile Numbers - addendum 14 Aug 2026
Reporter: PG | Row: 7
50th check Fri 14 Aug 2026 UTC

ROOT CAUSE (live data):
- 552 students with non-null phoneMobile not starting with + (unchanged)
- 418 students with + prefix but spaces or dashes (up 1 from 417)
- Total non-E.164: 970 of 14,462 total students (up 1 from 969)
- Day 36 since issue logged - fix not applied

FIX RECIPE (NOT YET RUN):
Step 1: strip spaces/dashes from + numbers:
  SQL: UPDATE Student SET phoneMobile = regexp_replace(phoneMobile, [ -], , g)
  WHERE phoneMobile LIKE +% AND phoneMobile ~ [ -]
Step 2: triage the 552 without + prefix manually (country code unknown).

RISK: data-hygiene. Reversible. Blast: up to 418 phone records.
STATUS: Open - fix NOT RUN. 970 non-E.164. Day 36.
Last checked: Fri 14 Aug 2026 UTC (50th check)