# Issue 33 — Shih-Wei Huang: Document 238 issued with wrong pronouns

Reporter: AC  Area: Documents  Sheet row: 34

## Symptom
Student 356 (Shih-Wei Huang) has gender = null in SIS. Document 238 (issued) has wrong pronouns. 44 days without fix.

## Root cause (confirmed 2026-08-01 UTC)
- Student 356 (Shih-Wei Huang): gender = null, HubSpot contact ID = 791708390643.
- Last student update: 2026-07-28 (bulk touch — gender still null).
- Document 238 (booking 560, v1): status = ISSUED with incorrect pronouns, last updated 2026-06-18 (44 days old).
- Document has not been revoked or regenerated since the issue was flagged.
- Booking 18138 (student 356): status = PENDING.

## Fix recipe (NOT YET RUN)

Step 1 — Confirm correct pronouns / gender from HubSpot (NOT YET RUN):
  GET https://api.hubapi.com/crm/v3/contacts/791708390643?properties=gender,firstname,lastname

Step 2 — Set gender on student 356 (NOT YET RUN):
  UPDATE student SET gender = "<correct_value>" WHERE id = 356;

Step 3 — Revoke document 238 (NOT YET RUN):
  UPDATE document_record SET status = "REVOKED" WHERE id = 238;

Step 4 — Regenerate via SIS admin (NOT YET RUN):
  Student 356 -> Booking 560 -> Documents -> Re-issue.

Step 5 — Verify:
  SELECT gender FROM student WHERE id = 356;
  SELECT id, status FROM document_record WHERE booking_id = 560 ORDER BY id;

## Risk
Category: documents / data-hygiene. Reversible: yes. Blast radius: 1 student, 1 document.

## Status: OPEN — 44 days, document still ISSUED with wrong pronouns
Last checked: 2026-08-01 UTC
