Issue 9 -- Suvderdene Bayartsog (addendum 30 Jul 2026)

Reporter: AC | Area: Doc Gen / Certs | Sheet row: 10

Symptom
Certificate automatically displays dates from previous course.

Root cause (Thu 30 Jul 2026 UTC)
- Document 171 (booking 1498): status = DRAFT, versionNo = 1 -- created 2026-06-05, never updated -- 55 days old
- Booking 1498: status = CONFIRMED, confirmed = false, amountOpen = null, amountPaid = null (Fidelo migration artefact)
- Student 947 (Suvderdene Bayartsog): visaStatus = null, hubspotContactId = 305177091285

Fix recipe (NOT YET RUN)

Option A -- Issue the document:
  1. SIS admin > booking 1498 > Documents > doc 171
  2. Review course dates are correct
  3. Click Issue

Option B -- Delete and regenerate:
  1. Delete doc 171 from booking 1498
  2. Generate fresh certificate from booking 1498

Also (after verifying payment in Hub/Xero):
  UPDATE booking SET confirmed = true WHERE id = 1498;

Risk: documents -- minimal blast radius; DRAFT not yet issued to student.

Status: Document 171 in DRAFT for 55 days (since Jun 5 2026). UNCHANGED.
Last checked: Thu 30 Jul 2026 UTC