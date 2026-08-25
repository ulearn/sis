# Issue 33 Addendum — Shih-Wei Huang (student 356)
Reporter: KC | Area: Documents | Sheet row 34

## Status — 36th check, Sun 23 Aug 2026 UTC

No change from 35th (Sat 22 Aug).

## Root cause

- Student 356 (Shih-Wei Huang): gender = null, updatedAt 2026-08-19 (profile edited 19 Aug, gender field left null)
- Document 238 (Booking 560, Exit Letter, template 4): ISSUED v1, created 2026-06-18 — 66 days with incorrect she/her pronouns

## Fix recipe — NOT YET RUN

1. Set gender: UPDATE Student SET gender = MALE, updatedAt = NOW() WHERE id = 356;
   Or SIS admin: Students > Shih-Wei Huang > Edit > Gender = Male.
2. Revoke document 238 via SIS admin.
3. Regenerate exit letter: Booking 560 > Documents > Generate Exit Letter.
4. Confirm new doc ISSUED with he/him pronouns.

## Note
Profile edited 19 Aug but gender not set. Neil: confirm what changed and that gender should be MALE.

## Risk
Category: documents | Reversible: yes | Blast radius: 1 student, 1 doc revoke+regenerate

## Status
Fix NOT RUN. Exit letter with wrong pronouns for 66 days.
Last checked: 2026-08-23 UTC (36th check)