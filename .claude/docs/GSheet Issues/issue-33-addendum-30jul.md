Issue 33 -- Shih-Wei Huang (addendum 30 Jul 2026)

Reporter: AC | Area: Doc Gen | Sheet row: 34

Symptom
SIS defaults to female gender when not set -- certificate uses incorrect pronouns.

Root cause (Thu 30 Jul 2026 UTC)
- Student 356 (Shih-Wei Huang): gender = null, hubspotContactId = 791708390643
- Last update: 2026-07-28 09:38 UTC (bulk touch -- gender still null)
- Document 238: status = ISSUED, versionNo = 1, created 2026-06-17, updated 2026-06-18, booking 560
- 42 days since certificate issued with incorrect pronouns (female default)

Fix recipe (NOT YET RUN)

Step 1 -- Determine correct gender:
  Check HubSpot contact 791708390643 for gender/salutation
  (Shih-Wei is a Taiwanese name -- verify male or female in HubSpot)

Step 2 -- Set gender on student record:
  UPDATE student SET gender = MALE WHERE id = 356;
  (replace MALE with actual value confirmed from HubSpot)

Step 3 -- Revoke and reissue document 238:
  1. SIS admin > booking 560 > Documents > doc 238 > Revoke
  2. Regenerate certificate (will use correct gender)
  3. Issue new version (versionNo = 2)

Risk: documents -- issued cert has wrong pronouns; revoke+reissue invalidates old QR. Reversible; low blast radius.

Status: UNCHANGED. Gender null. Doc 238 ISSUED with wrong pronouns (42 days).
Last checked: Thu 30 Jul 2026 UTC