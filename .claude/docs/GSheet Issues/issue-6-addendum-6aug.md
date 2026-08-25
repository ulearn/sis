# Issue 6 — Erroneous Mobile Numbers (addendum Thu 6 Aug 2026 15:02 UTC)

Reporter: PG | Area: Cleanup | Sheet row 7 | Check 32 | Day 22

## Symptom
Erroneous mobile numbers (non-E.164 format) across student records.

## Current state (confirmed 15:02 UTC)
- 975 students with non-E.164 phone numbers (unchanged)
- Total students with phone_mobile: 1,369

Updated since Aug 5 (3 students):
- Student 872 Wanying Song: +86 173 5653 5084 (spaces, still non-E164)
- Student 840 Diego Alves da Silva Molina: +55 35 98861 8205 (spaces, still non-E164)
- Student 14573 Giada Dimichino: +393280444260 (now E164 -- corrected)

## Fix recipe (NOT YET RUN)

1. Strip spaces and annotations from phone_mobile fields
2. Normalize to E.164 format (+countrycode + digits, no spaces/punctuation)
3. For numbers missing country code: look up student nationality to infer prefix

See prior recipe files for bulk normalization script.

## Risk / category
- Category: data-hygiene | Reversible: yes (backup before run) | Blast radius: up to 975 student records

## Status
OPEN -- fix NOT applied | Last checked: 2026-08-06 15:02 UTC | Day 22