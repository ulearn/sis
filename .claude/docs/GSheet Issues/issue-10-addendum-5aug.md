# Issue 10 — 42nd check Wed 5 Aug 2026

Reporter: various | Area: Doc Gen / Certs | Sheet row: 11

## State — verified 42nd check Wed 5 Aug 2026 UTC

Unchanged from 4 Aug:
- Booking 97 (Morning General, 27 Apr to 22 May 2026): EUR 1,741 / 1,741 paid, confirmed=false (anomaly)
- Documents on booking 97: Doc 63 (REVOKED invoice v1) + Doc 64 (ISSUED invoice v1) — no completion cert
- Booking course 107 (Morning General, ends 2026-05-22): active=true, 1 SCA — 75 days stale
- Booking course 24793 (General English AM, ends 2026-06-05): active=true, 1 SCA — 61 days stale

Student cannot get cert because 2 stale BCs are still active, preventing clean cert generation.

## Fix Recipe (NOT YET RUN)

1. Deactivate stale BCs: UPDATE booking_course SET active = false WHERE id IN (107, 24793);
2. Set confirmed=true on booking 97 (payment EUR 1,741 is fully received): UPDATE booking SET confirmed = true WHERE id = 97;
3. Generate completion cert for booking 97 via SIS admin.

Risk: documents / data-hygiene. Reversible. Blast radius: 1 student cert.

Status: UNCHANGED — awaiting Neil action. Last checked: Wed 5 Aug 2026 UTC (42nd check).
See also: issue-10-addendum-4aug.md and issue-9-massimiliano-cert-split.md for full context.