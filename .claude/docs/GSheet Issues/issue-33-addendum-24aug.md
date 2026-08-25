# Issue 33 — Shih-Wei Huang (gender null, wrong pronouns in exit letter)

**Area:** Documents  **Sheet row:** 34

## Symptom
SIS may be defaulting to female gender when gender is not entered in student profile.

## Root cause (37th check Mon 24 Aug 2026 UTC)
- Student 356 (Shih-Wei Huang): gender = null (still not set; last student record update 19 Aug 2026)
- Document 238 (Exit Letter, template 4, booking 560): ISSUED v1, created 17 Jun 2026 — 68 days old with she/her pronouns (generated when gender was null, defaulted to female)
- Root cause: SIS template renders gender-specific pronouns; null gender defaulted to she/her (not explicitly confirmed but inferred from issue G)

## Fix recipe (NOT YET RUN)

Step 1: Confirm Shih-Wei Huang's correct gender with the student or via HubSpot contact record.

Step 2: Update student gender in SIS:
  UPDATE students SET gender = 'MALE' WHERE id = 356;
  -- (use correct gender value once confirmed)

Step 3: Revoke Document 238:
  UPDATE document_records SET status = 'REVOKED' WHERE id = 238;

Step 4: Regenerate exit letter via SIS admin — new doc will use updated gender.

## Risk
documents — reversible. Only student 356, document 238 affected. New doc version required.

## Status: Open — fix NOT RUN
**Last checked:** 37th check Mon 24 Aug 2026 UTC (no change since 36th Sun 23 Aug)