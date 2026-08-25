Issue 10 - Massimiliano Cameran - 30 Jul 2026 UTC (39th check)
---------------------------------------------------------------
Root cause (unchanged):
- Booking 97 (Morning General, 27 Apr-22 May 2026): EUR 1741/1741 paid, confirmed=false. No cert (only REVOKED invoice doc63 + ISSUED invoice doc64).
- Booking course 107 (ended 22 May 2026): active=true -- 69 days stale.
- Booking course 24793 (ended 5 Jun 2026): active=true -- 55 days stale.
- Doc 179 on booking 18002: ISSUED for May 25-Jun 5 period only (wrong period).

Fix recipe (NOT YET RUN):
1. Generate completion cert for booking 97 via SIS doc-gen.
2. UPDATE booking_course SET active = false WHERE id IN (107, 24793);
3. Optionally revoke doc 179 on booking 18002.
4. Confirm with accounts before setting confirmed=true on booking 97.

Risk: documents + data-hygiene; reversible.
Status: OPEN - unchanged since 29 Jul 2026. Last checked: Thu 30 Jul 2026 UTC
