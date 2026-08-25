# Issue 6 — Non-E.164 Phone Numbers (6 fixed since 15:02)
Reporter: PG | Area: Overview | Sheet row: 7

## Root Cause (verified 16:02 UTC Thu 6 Aug 2026)
969 students with non-E.164 phone_mobile (was 975 at 15:02 UTC today, 6 fixed in ~1h).
Total students with phone: 1,369. Non-E.164: 969 (71%).

## Fix Recipe (NOT YET RUN)
Strip spaces, hyphens, parens; normalise to E.164 (+countrycode + digits).
See earlier recipe: issue-6-addendum-6aug.md for full script approach.

## Status
969 non-E.164 phones (was 975). 6 corrected since 15:02 UTC today. Day 22.
Last checked: 16:02 UTC Thu 6 Aug 2026