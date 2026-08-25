# Issue 9 — Suvderdene Bayartsog (draft cert 54 days old)
Reporter: AC | Area: Doc Gen / Certs | Sheet row 10

## Current state — 50th check Wed 29 Jul 2026 UTC
Unchanged from 28 Jul:
- Document 171 (booking 1498): status = DRAFT, versionNo = 1 — 54 days old, never updated
- Booking 1498: status = CONFIRMED, confirmed = false, amountPaid = null, amountTotal = null

## Fix recipe (NOT YET RUN)
Option A: Issue draft via SIS admin after verifying dates show current course (not previous).
Option B: Delete doc 171 if content is wrong, then regenerate.
  p.documentRecord.delete(id=171)
Optional: Set booking 1498 confirmed=true after verifying booking is genuinely confirmed.

Full script in: issue-9-addendum-28jul.md

## Risk
- Category: documents | Reversible: Deleting DRAFT is low-risk | Blast radius: 1 student

## Status
Open — fix NOT run. Document 171 in DRAFT for 54 days.
Last checked: Wed 29 Jul 2026 UTC
