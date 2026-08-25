Issue 16 - Stale Booking Accommodations (24th check, 12 Aug 2026)

Sheet row: 17  Reporter: NM  Area: Booking/Accommodation

Symptom: 4 Booking Accommodations remain active past their end date.

Evidence (DB confirmed 12 Aug 2026):
- BA 11216 (booking 46): ended 2026-05-09 — 95 days stale, active=true, fee EUR 1,440
- BA 11158 (booking 100): ended 2026-05-17 — 87 days stale, active=true, fee EUR 193.33
- BA 11282 (booking 17897): ended 2026-06-05 — 68 days stale, active=true, fee EUR 720
  (overlap: BA 11282 starts May 15, BA 11158 ends May 17)
- BA 11361 (booking 18190): ended 2026-08-09 — 3 days stale, active=true, fee EUR 750

Fix Recipe - NOT YET RUN:
  UPDATE booking_accommodation SET active=false WHERE id IN (11216, 11158, 11282, 11361);
  Verify Xero reconciliation for BA 11216 (EUR 1,440) before deactivating.

Risk: data-hygiene. Reversible. Low blast radius.
Status: Fix NOT RUN. Last checked: Wed 12 Aug 2026 UTC (24th check)