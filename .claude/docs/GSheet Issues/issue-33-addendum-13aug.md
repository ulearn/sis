# Issue 33 — Shih-Wei Huang (addendum 13 Aug 2026)

**Reporter:** ST | **Area:** documents | **Sheet row:** 34 | **Check:** 26th Thu 13 Aug 2026 UTC

## Symptom
SIS defaulted to female she/her pronouns on exit letter because gender was null.

## Root cause (unchanged)
- Student 356 (Shih-Wei Huang): gender = null, last updated 2026-07-28 (16 days ago)
- Document 238 (Exit Letter, bk 560): status = ISSUED, versionNo = 1, sole doc on bk 560, issued 2026-06-17 (57 days ago) with incorrect she/her pronouns
- No superseding version exists

## Fix recipe (NOT YET RUN)

### Step 1 — Set gender
UPDATE Student SET gender = MALE, updatedAt = NOW() WHERE id = 356;

### Step 2 — Revoke document 238
UPDATE DocumentRecord SET status = REVOKED, updatedAt = NOW() WHERE id = 238;

### Step 3 — Regenerate exit letter
SIS admin — Student 356 — Bookings — Booking 560 — Generate Exit Letter. Verify he/him before issuing.

## Risk / category
- Category: documents
- Reversible: yes
- Blast radius: low — student 356, booking 560 only

## Status
Unchanged — gender null 16d, doc 238 ISSUED 57d with wrong pronouns. Fix NOT RUN.

**Last checked:** 2026-08-13 UTC