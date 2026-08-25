## Issue 33 — Shih-Wei Huang (addendum 21 Aug 2026)
Reporter: KC | Area: Documents | Sheet row 34

Symptom: SIS defaulted to female gender — exit letter doc 238 has she/her pronouns.

Root cause (34th check Fri 21 Aug UTC):
- Student 356 (Shih-Wei Huang): gender=null, updatedAt=2026-08-19 (touched 2d ago, gender still not set)
- Document 238 (Booking 560, template 4): ISSUED v1, created 17 Jun 2026, 65 days old, incorrect female pronouns

New finding (21 Aug): Student 356 updatedAt changed to 19 Aug 2026.
Someone edited the profile on Tue 19 Aug but left gender=null. Neil: check what changed and set gender=MALE.

Fix recipe (NOT YET RUN):
1. UPDATE students SET gender='MALE', updated_at=NOW() WHERE id=356;
   (Or admin UI: Students > Shih-Wei Huang > Edit > Gender = Male)
2. Revoke document 238 (admin UI: Documents > doc 238 > Revoke).
3. Regenerate exit letter: Booking 560 > Documents > Generate Exit Letter.
4. Confirm new doc ISSUED with he/him pronouns.

Risk: Documents — revoking doc 238 invalidates existing letter; notify student/agent.
Reversible. Blast radius: 1 student, 1 document.
Status: Fix NOT RUN. Last checked: Fri 21 Aug 2026 UTC.