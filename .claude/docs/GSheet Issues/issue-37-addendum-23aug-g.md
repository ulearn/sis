# Issue 37 & 43 — Bed 83 Stale BAs (484th run, Sun 23 Aug 2026 UTC)

Reporter: KC | Area: Booking / Accomm | Sheet rows: 39 + 45

## Root cause (unchanged from 476th run today)
Bed 83 has 5 past occupants with stale active BAs:
- BA 11239 (Ivan Rodriguez Solares): ended 2026-05-24 — 91 days stale, fee=EUR 1,050
- BA 11168 (Diego Da Silva Saldanha): ended 2026-06-20 — 64 days stale, fee=EUR 700
- BA 11285 (Jesus Manuel Ramirez Diaz): ended 2026-07-05 — 49 days stale, fee=null
- BA 11352 (Veronica Martin): ended 2026-07-11 — 43 days stale, fee=EUR 360
- BA 11179 (Africa Mera Bachir): ended 2026-08-09 — 14 days stale, fee=EUR 1,360

DO NOT TOUCH (current/next occupants):
- BA 11173 (current occupant): ends 2026-08-30
- BA 25 (Rosa Maria Mollica): starts 2026-08-30 — ARRIVES IN 7 DAYS

Fix NOT RUN.

## Fix recipe (NOT YET RUN) — DEADLINE: before 2026-08-30

Step 1 — Deactivate 5 stale BAs:
  UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Step 2 — Verify bed 83:
  SELECT id, start_date, end_date, active FROM booking_accommodations WHERE bed_id = 83 ORDER BY start_date;
  Expected: only BA 11173 and BA 25 remain active.

## Risk / category
- Category: data-hygiene | Reversible: yes | Blast radius: bed 83 view only
- DEADLINE: before Rosa Maria Mollica arrives 30 Aug 2026 (7 days)

Status: OPEN — Fix NOT RUN
Last checked: 2026-08-23 UTC (484th run)