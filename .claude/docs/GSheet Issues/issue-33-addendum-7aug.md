# Issue 33 — Shih-Wei Huang gender null / wrong pronouns (addendum 7 Aug 2026)
Reporter: ST | Area: Documents | Sheet row: 34

## Symptom
SIS defaulted to she/her for student with null gender; Exit Letter issued with wrong pronouns.

## Root cause
20th check (Fri 7 Aug 2026 UTC) — unchanged from 19th check (Thu 6 Aug).

- Student 356 (Shih-Wei Huang): gender = null, HubSpot contact ID 791708390643
- Last student update: 2026-07-28 09:38 UTC — gender still null, 10 days no action
- Document 238 (Exit Letter, booking 560): ISSUED 2026-06-17 — 51 days since issued with incorrect she/her pronouns

## Fix recipe (NOT YET RUN)

Step 1 — Set gender in HubSpot (NOT YET RUN)
Open HubSpot contact 791708390643, set gender to correct value (likely male — confirm with staff).

Step 2 — Revoke doc 238 and regenerate (NOT YET RUN)
Revoke via psql:  UPDATE document_record SET status = 'REVOKED' WHERE id = 238;
Then regenerate through SIS admin UI.

## Risk / category
documents, data-hygiene. Reversible. Blast radius: 1 student, 1 document.

## Status
Open — 51 days since wrong-pronoun document issued. Fix NOT RUN.

## Last checked (UTC)
2026-08-07