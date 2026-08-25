# Issue 33 — Shih-Wei Huang: Document 238 issued with wrong pronouns (46 days)

Reporter: (various)  Area: Documents  Sheet row: 34

## Root cause (confirmed 2026-08-03 UTC)
- Student 356 (Shih-Wei Huang): gender = null, HubSpot contact ID = 791708390643.
- Last student update: 2026-07-28 (bulk system touch — gender still null).
- Document 238 (booking 560, v1): status = ISSUED with wrong pronouns, last updated 2026-06-18 — 46 days, not revoked.
- No change from 14th check (Sat 1 Aug).

## Fix recipe (NOT YET RUN)

Step 1 — Get correct gender from HubSpot contact 791708390643 (NOT YET RUN):
  GET /crm/v3/contacts/791708390643?properties=gender,firstname,lastname

Step 2 — Set gender on student 356 (NOT YET RUN):
  UPDATE student SET gender = <correct_value> WHERE id = 356;

Step 3 — Revoke document 238 (NOT YET RUN):
  UPDATE document_record SET status = REVOKED WHERE id = 238;

Step 4 — Regenerate via SIS admin: Student 356 -> Booking 560 -> Documents -> Re-issue (NOT YET RUN).

Step 5 — Verify (NOT YET RUN):
  SELECT gender FROM student WHERE id = 356;
  SELECT id, status FROM document_record WHERE booking_id = 560 ORDER BY id;

## Risk
Category: documents / data-hygiene. Reversible: yes. Blast radius: 1 student, 1 document.

## Status: OPEN — 46 days, gender null, document 238 ISSUED with wrong pronouns
Last checked: 2026-08-03 UTC (15th hourly check)
