# Issue 37 - Bed 83 Stale BAs (DEADLINE AUG 30)
Reporter: KC | Row 39 | 500th run Mon 24 Aug 2026 UTC

## Root cause
Bed 83 has 5 stale active Booking Accommodations. Next occupant (Rosa Maria Mollica, BA 25) starts 30 Aug 2026 = 6 DAYS AWAY.

Stale BAs (active = true, ended before today):
- BA 11239: Ivan Rodriguez Solares, ended 24 May 2026, fee EUR 1,050 (92 days stale)
- BA 11168: Diego Da Silva Saldanha, ended 20 Jun 2026, fee EUR 700 (65 days stale)
- BA 11285: Jesus Manuel Ramirez Diaz, ended 5 Jul 2026, fee null (50 days stale)
- BA 11352: Veronica Martin, ended 11 Jul 2026, fee EUR 360 (44 days stale)
- BA 11179: Africa Mera Bachir, ended 9 Aug 2026, fee EUR 1,360 (15 days stale)

Current tenant: BA 11173 (Alessandro Signorotti), ends 30 Aug 2026.
Next tenant: BA 25 (Rosa Maria Mollica), starts 30 Aug 2026.

## Fix recipe (NOT YET RUN)

Deactivate the 5 stale BAs:

  UPDATE booking_accommodation SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

DO NOT touch BA 11173 (current tenant, ends 30 Aug) or BA 25 (next tenant).

## Risk
- Category: bookings / accommodation
- Reversible: yes (set active = true to undo)
- Blast radius: 5 historical BAs, all ended months ago
- DEADLINE: 30 Aug 2026 (6 days) - must be done before Rosa Maria checks in

## Last checked
500th run Mon 24 Aug 2026 UTC
