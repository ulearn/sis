Issue 37 — Veronica Martin / Bed 83 Stale Booking Accommodations
Reporter: KC | Area: Booking / Accomm | Sheet row 39

Root cause (474th run, 23 Aug 2026 UTC)
No change since 472nd run. 5 stale BAs confirmed from fresh DB query:

- BA 11239 (booking 22, Ivan Rodriguez Solares): bed 83, 3 May – 24 May 2026, active = true — 91 days stale, fee EUR 1,050
- BA 11168 (booking 92, Diego Da Silva Saldanha): bed 83, 6 Jun – 20 Jun 2026, active = true — 64 days stale, fee EUR 700
- BA 11285 (booking 17825, Jesus Manuel Ramirez Diaz): bed 83, 21 Jun – 5 Jul 2026, active = true — 49 days stale, fee = null
- BA 11352 (booking 18156, Veronica Martin): bed 83, 4 Jul – 11 Jul 2026, active = true — 43 days stale, fee EUR 360
- BA 11179 (booking 82, Africa Mera Bachir): bed 83, 12 Jul – 9 Aug 2026, active = true — 14 days stale, fee EUR 1,360

Current valid BAs (DO NOT TOUCH):
- BA 11173 (booking 88): bed 83, 9 Aug – 30 Aug 2026, active = true, fee EUR 1,080
- BA 25 (booking 17844): bed 83, 30 Aug – 11 Oct 2026, starts in 7 DAYS

Fix recipe (NOT YET RUN)

  UPDATE booking_accommodations SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

Verify:
  SELECT id, start_date, end_date, active FROM booking_accommodations
  WHERE bed_id = 83 ORDER BY start_date;

Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes (SET active = true to undo)
- Blast radius: bed 83 allocation view only; no financial impact
- DEADLINE: before 30 Aug 2026 (7 days)

Status: FIX NOT RUN
Last checked: 2026-08-23 UTC (474th run)