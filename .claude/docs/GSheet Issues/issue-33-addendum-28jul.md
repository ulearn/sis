Issue 33 - Shih-Wei Huang - Gender Null / Wrong Pronouns (11th check, Tue 28 Jul 2026)

Reporter: PG | Area: Documents | Sheet row: 34

Current state (Tue 28 Jul 2026 UTC):
- Student 356 (Shih-Wei Huang): gender = null
  updatedAt = 2026-07-28T09:38:13 UTC - same bulk touch as student 1063; gender STILL null after bulk update
- Document 238 (exit letter, booking 560): ISSUED v1, created 2026-06-17, updated 2026-06-18
  40 days with wrong Ms./she/her pronouns
- Code defect: src/scripts/documents.ts approx line 338 - null gender defaults to female salutation

Fix recipe (NOT YET RUN):
1. UPDATE Student SET gender = male WHERE id = 356
2. Revoke document 238 in SIS admin
3. Regenerate exit letter for booking 560 - should now show Mr./he/him
4. Code fix in src/scripts/documents.ts approx L338: change null-gender default to Mx. or require gender

Risk: Documents | Low blast radius | Reversible | Dignity issue (40 days wrong pronouns)

Status: UNCHANGED - Fix NOT RUN. Automated sync today 09:38 UTC did NOT fill gender.
Last checked: Tue 28 Jul 2026 UTC