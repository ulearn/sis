# Issue 6 — Non-E.164 Phone Numbers (42nd check, Tue 11 Aug 2026 UTC)
Reporter: PG | Area: Overview | Sheet row: 7

## Status
Unchanged from 41st check (Mon 10 Aug 2026). 966 students with non-E.164 phone numbers. Day 29.

## Root Cause (carried from Aug 6 check)
- 966 students with non-E.164 phone_mobile (552 without + prefix, 414 with + but containing spaces)
- Total students with mobile on record: 1,369. Non-E.164: 966 (71%)

## Fix Recipe (NOT YET RUN)
Strip spaces, hyphens, parens; normalise to E.164 (+countrycode + digits).
See full script: issue-6-addendum-6aug.md / issue-6-addendum-6aug-b.md

## Last checked: 2026-08-11 UTC