# Issue 10 — Massimiliano Cameran (no cert for Apr 27-May 22)
Reporter: AC | Area: Doc Gen / Certs | Sheet row 11

## Current state — 38th check Wed 29 Jul 2026 UTC
Unchanged from 28 Jul. New detail: docs 63+64 on booking 97 confirmed as invoices.
- Booking 97: EUR 1741/1741 fully paid, status CONFIRMED, confirmed = false (anomaly)
- Docs on booking 97: doc 63 (REVOKED invoice), doc 64 (ISSUED invoice C-2026-000064)
  Content-inspected: doc 64 billed to LanguageCourse S.L. — NOT a completion cert.
  Booking 97 has NO completion certificate.
- Doc 179 on booking 18002: ISSUED 5 Jun — shows May 25-Jun 5 only (wrong period)
- Booking course 107 (ended 22 May 2026): 68 days stale, active = true
- Booking course 24793 (ended 5 Jun 2026): 54 days stale, active = true

## Fix recipe (NOT YET RUN)
Step 1: Generate cert for booking 97 (Apr 27-May 22) via SIS admin.
Step 2: Optionally revoke doc 179 (wrong cert on booking 18002).
  p.documentRecord.update(id=179, status=REVOKED)
Step 3: Deactivate stale BCs 107 and 24793.
  p.bookingCourse.updateMany(ids=[107,24793], active=false)

Full script in: issue-9-massimiliano-cert-split.md

## Risk
- Category: documents | Reversible: Yes | Blast radius: 1 student

## Status
Open — fix NOT run. No cert for Apr 27-May 22 course.
Last checked: Wed 29 Jul 2026 UTC
