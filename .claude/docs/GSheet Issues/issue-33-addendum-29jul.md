# Issue 33 — Shih-Wei Huang (wrong pronouns in issued exit letter)
Reporter: Staff | Area: Documents | Sheet row 34

## Current state — 12th check Wed 29 Jul 2026 UTC
Unchanged from 28 Jul:
- Student 356 (Shih-Wei Huang): gender = null
  Bulk touch 28 Jul 09:38 UTC updated updatedAt but gender remains null.
- Document 238 (exit letter, booking 560): ISSUED 18 Jun 2026 — 41 days with wrong Ms./she/her
- Code defect: src/scripts/documents.ts approx line 338 — null gender defaults to female salutation

## Fix recipe (NOT YET RUN)
Step 1: Set gender = M for student 356 via SIS admin.
Step 2: Revoke doc 238 and regenerate.
  p.documentRecord.update(id=238, status=REVOKED)
  Then regenerate exit letter via SIS admin — will now use Mr./he/his pronouns.
Step 3 (code fix, lower priority): Update documents.ts approx line 338.
  Change null gender from defaulting to female to neutral or require gender before generation.

Full context in: issue-33-addendum-28jul.md

## Risk
- Category: documents | Reversible: Yes | Blast radius: 1 student

## Status
Open — fix NOT run. Doc 238 wrong pronouns for 41 days.
Last checked: Wed 29 Jul 2026 UTC
