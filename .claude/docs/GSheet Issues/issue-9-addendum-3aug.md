# Issue 9 — Suvderdene Bayartsog: Document 171 still DRAFT (59 days)

Reporter: NM  Area: Doc Gen / Certs  Sheet row: 10

## Symptom
Certificate shows wrong dates. Document 171 created DRAFT 59 days ago, never issued.

## Root cause (confirmed 2026-08-03 UTC)
- Document record 171 (booking 1498): status = DRAFT, versionNo = 1, created 2026-06-05, no revisions.
- Booking 1498: status = CONFIRMED, confirmed = false, amountPaid = null, amountOpen = null.
- No change from 53rd check (Sun 2 Aug).

## Fix recipe (NOT YET RUN)

Step 1 — Review doc 171 content (NOT YET RUN):
  SELECT content_html FROM document_record WHERE id = 171;

Step 2 — Delete draft and regenerate (NOT YET RUN):
  Student -> Booking 1498 -> Documents -> Delete draft 171 -> Re-generate.

Step 3 — Confirm booking 1498 once payment verified (NOT YET RUN):
  UPDATE booking SET confirmed = true WHERE id = 1498;

Step 4 — Verify (NOT YET RUN):
  SELECT id, status, version_no FROM document_record WHERE booking_id = 1498;

## Risk
Category: documents. Reversible: yes. Blast radius: 1 student, 1 document.

## Status: OPEN — 59 days, document still DRAFT
Last checked: 2026-08-03 UTC (54th hourly check)
