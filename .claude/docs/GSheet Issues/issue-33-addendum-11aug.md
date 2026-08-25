# Issue 33 — Shih-Wei Huang — Exit Letter with Wrong Pronouns
Reporter: staff | Area: Documents | Sheet row 34 | 24th hourly check Tue 11 Aug 2026 UTC

## Symptom
SIS generated Exit Letter with she/her pronouns for a male student because gender is null.

## Root cause (live data, 11 Aug 2026)
- Student 356 (Shih-Wei Huang): gender = null, last updated 2026-07-28 (14 days ago, no correction)
- Document 238 (exit_letter, booking 560): status = ISSUED, version_no = 1
  - Issued 17 Jun 2026 — 55 days with incorrect she/her pronouns
- No superseding version exists for booking 560 (one doc record only)
- Root cause: gender null -> template defaults to she/her -> wrong ISSUED document

## Fix recipe — NOT YET RUN

Step 1 — Set gender via SIS admin (student 356) or:
  SELECT DISTINCT gender FROM students WHERE gender IS NOT NULL LIMIT 5;  -- check enum values
  UPDATE students SET gender = 'male' WHERE id = 356;

Step 2 — Regenerate Exit Letter from booking 560 -> Documents -> regenerate.
  Creates version_no = 2 superseding doc 238, with correct he/his pronouns.

Step 3 — Verify correct pronouns in new document.

Step 4 — If old document was sent to student/agent, re-send corrected version.

## Risk
Category: documents | Reversible: yes | Blast radius: single student, single document

## Status
14 days since last student update, no correction. 55 days since wrong doc issued. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC