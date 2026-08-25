# Issue 43 addendum 8 Aug -- CORRECTION: 4 stale BAs on bed 83 (not 2)

BA 11285 (Jesus Manuel Ramirez Diaz, booking 17825, bed 83): ended 2026-07-05, 34d stale, active=true.
BA 11352 (Veronica Martin, booking 18156, bed 83): ended 2026-07-11, 28d stale, active=true.
BA 11168 (Diego Da Silva Saldanha, bed 83): ended 2026-06-20, 49d stale, active=true. [NEW this check]
BA 11239 (Ivan Rodriguez Solares, bed 83): ended 2026-05-24, 76d stale, active=true. [NEW this check]

Bed 83: Africa Mera Bachir (BA 11179) leaves tomorrow 2026-08-09; Alessandro Signorotti (BA 11173) arrives same day.
All 4 stale BAs pre-date current/incoming occupants -- safe to deactivate.

FIX NOT RUN:
  UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352, 11168, 11239);

Verify: SELECT id, active, end_date FROM booking_accommodation WHERE id IN (11285, 11352, 11168, 11239);

Risk: data-hygiene, reversible. Blast radius: 4 stale records on bed 83, cosmetic only.
Last checked: 2026-08-08 UTC