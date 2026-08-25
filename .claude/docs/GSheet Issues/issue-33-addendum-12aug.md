# Issue 33 — Shih-Wei Huang (25th check, Wed 12 Aug 2026)

**Reporter:** Staff  **Area:** Documents  **Sheet row:** 34

## Symptom
Exit Letter (document 238) generated with incorrect she/her pronouns. Student is male.

## Root cause (evidence from 12 Aug 2026 query)
- Student 356 (Shih-Wei Huang): gender = null, last updated 2026-07-28 (15 days ago)
- Document 238 (Exit Letter, booking 560): status = ISSUED, versionNo = 1, issued 2026-06-17 — 56 days with incorrect pronouns
- Only one document record exists for booking 560 — no superseding version
- Booking 560: CONFIRMED, confirmed = true
- Root cause: gender = null caused document template to default to female pronouns

## Fix recipe (NOT YET RUN)

### Step 1 — Set student 356 gender to male
```sql
UPDATE "Student" SET gender = 'male' WHERE id = 356;
```
Verify: SELECT id, "firstName", "lastName", gender FROM "Student" WHERE id = 356;

### Step 2 — Revoke document 238 and regenerate
```sql
UPDATE "DocumentRecord" SET status = 'REVOKED' WHERE id = 238;
```
Then regenerate via SIS admin: Booking 560 > Documents > Generate Exit Letter.
New document will use correct he/him pronouns.

## Risk / category
- Documents — moderate. Revoking and regenerating is the clean path.
- Reversible: old doc 238 kept as REVOKED for audit trail.
- Blast radius: single document, single student, no financial impact.

## Status
Open — gender null 15 days; doc 238 ISSUED 56 days with wrong pronouns. Fix NOT RUN.

**Last checked:** 2026-08-12 UTC