Issue 33 Addendum 25 Aug 2026

38th check Tue 25 Aug 2026 UTC
Student 356 (Shih-Wei Huang): gender = null, last updated 2026-08-19
Document 238 (booking 560, Exit Letter, template 4): ISSUED v1, created 2026-06-17 — 69 days with incorrect she/her pronouns
Gender was null at generation; template defaulted to she/her. No change from 37th check (Mon 24 Aug).

Fix (NOT YET RUN):
1. Confirm correct gender with staff, UPDATE students SET gender = Male WHERE id = 356
2. Revoke document: UPDATE document_records SET status = REVOKED WHERE id = 238
3. Regenerate Exit Letter for booking 560 via SIS admin UI
4. (Code improvement) Audit templates — null gender should fall back to neutral pronoun (they/them)

Risk: documents | reversible | student 356 only
Status: Open. Gender null. Exit letter ISSUED 69 days with wrong pronouns.
Last checked: 2026-08-25 UTC (520th run, 38th issue check)