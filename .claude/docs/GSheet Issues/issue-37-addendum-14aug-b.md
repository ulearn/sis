# Issue 37 ## Bed 83 Stale BAs / Veronica Martin (31st check)
Reporter: AC | Area: Booking/Accomm | Sheet row 39 | Fri 14 Aug 2026 UTC

## Root cause: 5 stale BAs on bed 83 (active=true past endDate):
- BA 11239 Ivan Rodriguez Solares: ended 2026-05-24 (82d stale)
- BA 11168 Diego Da Silva Saldanha: ended 2026-06-20 (55d stale)
- BA 11285 Jesus Manuel Ramirez Diaz: ended 2026-07-05 (40d stale, fee=null)
- BA 11352 Veronica Martin: ended 2026-07-11 (34d stale)
- BA 11179 Africa Mera Bachir: ended 2026-08-09 (5d stale)
Current occupant: BA 11173 Alessandro Signorotti Aug 9-30 (not stale)
Next occupant: BA 25 Rosa Maria Mollica arrives 2026-08-30 (16 days)

## Fix recipe (NOT YET RUN)
  UPDATE booking_accommodation SET active = false, updatedAt = NOW()
  WHERE id IN (11239, 11168, 11285, 11352, 11179);
Also confirm and set fee for BA 11285 (currently null).

Risk: bookings/data-hygiene | Reversible: yes | Blast radius: bed 83 view only
Status: Open - fix NOT RUN. Aug 30 check-in (16 days). Last checked: 2026-08-14 UTC (31st)