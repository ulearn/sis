# Issue 37 — Bed 83 stale booking accommodations (addendum 24 Aug b)

**Area:** Booking / Accommodation  **Sheet row:** 39

## Status update (507th check Mon 24 Aug 2026 UTC)
No change since 506th check (earlier today, Mon 24 Aug).

5 stale Booking Accommodations on bed 83 still active = true:
- BA 11239 (Ivan Rodriguez Solares): ended 24 May 2026 — 92 days stale
- BA 11168 (Diego Da Silva Saldanha): ended 20 Jun 2026 — 65 days stale
- BA 11285 (Jesus Manuel Ramirez Diaz): ended 5 Jul 2026 — 50 days stale, fee null
- BA 11352 (Veronica Martin): ended 11 Jul 2026 — 44 days stale
- BA 11179 (Africa Mera Bachir): ended 9 Aug 2026 — 15 days stale

Current occupant: BA 11173 (Alessandro Signorotti), ends 30 Aug 2026.
Next occupant: BA 25 (Rosa Maria Mollica), starts 30 Aug 2026 — DEADLINE 6 DAYS.

## Fix recipe (NOT YET RUN)
See issue-37-addendum-24aug.md for full fix. Summary:
  UPDATE booking_accommodations SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

## Status: URGENT — fix NOT RUN — DEADLINE Aug 30
**Last checked:** 507th check Mon 24 Aug 2026 UTC