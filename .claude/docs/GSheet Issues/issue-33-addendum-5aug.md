Issue 33 — Shih-Wei Huang: Gender Null + Document 238 Wrong Pronouns
17th check Wed 5 Aug 2026 UTC
Reporter: NM | Area: Documents | Sheet row: 34

Symptom
Exit letter (doc 238) generated with she/her pronouns; student is male. Gender field null in DB.

Root Cause (verified 2026-08-05, 17th check — UNCHANGED)
- Student 356 (Shih-Wei Huang): gender = null.
- HubSpot contact ID: 791708390643 (linked, no fetch error).
- Last student update: 2026-07-28 (bulk touch — gender field still null).
- Document 238 (booking 560, v1): status = ISSUED, created 2026-06-17 — 49 days old with wrong pronouns.

Fix Recipe (NOT YET RUN)

Step 1 — Set gender on student 356:
  SIS admin: Student 356 > Edit > Gender > Male > Save.
  OR via DB: UPDATE students SET gender = 'MALE', updated_at = NOW() WHERE id = 356;

Step 2 — Revoke document 238:
  SIS admin: Booking 560 > Documents > Document 238 > Revoke.

Step 3 — Regenerate the exit letter:
  SIS admin: Booking 560 > Documents > Generate > Letter of Acceptance (or Exit Letter).
  Verify pronouns are he/him in the new draft before issuing.

Step 4 — Verify:
  SELECT gender FROM students WHERE id = 356;
  SELECT id, status FROM "DocumentRecord" WHERE booking_id = 560 ORDER BY created_at DESC;

Risk / Category
documents | Reversible: yes | Student 356 only

Status: NOT YET RUN | Last checked: 2026-08-05 UTC (17th check)
Doc 238 ISSUED 49 days (since Jun 17). Gender null despite Jul 28 bulk touch.