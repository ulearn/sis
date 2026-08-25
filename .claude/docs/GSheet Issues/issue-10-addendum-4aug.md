# Issue 10 — Massimiliano Cameran — No Completion Cert (addendum 4 Aug 2026)
Reporter: AC | Area: Doc Gen / Certs | Sheet row: 11

## Symptom
Certificate only shows last two weeks; editing function not working.

## Root cause
41st check (Tue 4 Aug 2026 UTC) — unchanged.

- Booking 97 (Morning General, 27 Apr to 22 May 2026): student 91, EUR 1741/1741 paid, confirmed = false
- Documents: doc 63 (accounts, REVOKED) + doc 64 (accounts, ISSUED) — no completion cert
- Booking course 107 (Morning General, ended 22 May 2026): active = true — 74 days stale
- Booking course 24793 (General English AM, ended 5 Jun 2026): active = true — 60 days stale

Full history in issue-10-addendum-30jul.md.
## Fix recipe (NOT YET RUN)
1. Set booking 97 confirmed = true:
   UPDATE booking SET confirmed = true WHERE id = 97;
2. Deactivate stale booking courses:
   UPDATE booking_course SET active = false WHERE id IN (107, 24793);
3. Generate completion certificate for booking 97 via SIS admin.
## Risk / category
documents | bookings | data-hygiene. Reversible. Blast radius: 1 student.
## Status
Open — 74 days max staleness. No cert. Fix NOT RUN.
## Last checked (UTC)
Tue 4 Aug 2026