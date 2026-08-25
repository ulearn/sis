# Issue 9 — 56th check Wed 5 Aug 2026

Reporter: AC | Area: Doc Gen / Certs | Sheet row: 10

## State — verified 56th check Wed 5 Aug 2026 UTC

Unchanged from 4 Aug:
- Document 171: status=DRAFT, versionNo=1, verificationToken=null — 61 days old (created 2026-06-05), never issued
- Booking 1498 (Suvderdene Bayartsog, student 947): status=CONFIRMED, confirmed=false, amountPaid=null, amountOpen=null

The certificate shows wrong course dates (displays previous course dates).
Booking 1498 has confirmed=false and null amounts — anomalous for a confirmed booking.

## Fix Recipe (NOT YET RUN)

1. Investigate doc 171 content: check which course dates it shows vs correct dates.
2. If dates wrong: regenerate or manually correct the cert, then issue it.
3. If doc OK: issue doc 171 via SIS admin document record interface.
4. Investigate booking 1498 confirmed=false + null amounts: set confirmed=true if payment verified.

Risk: documents. Reversible. Blast radius: 1 student cert.

Status: UNCHANGED — awaiting Neil action. Last checked: Wed 5 Aug 2026 UTC (56th check).
See also: issue-9-addendum-4aug.md and issue-9-suvderdene-draft-cert.md for full context.