Issue 43 addendum 29 Jul 2026
Jesus Manuel Ramirez Diaz / bed 83 (BAs 11285 + 11352)
Reporter: KC | Area: Booking / Accomm | Sheet row: 45

Symptom: Accommodation dates should be from June 20th to July 4th.

Root cause (confirmed — same as Issue 37):
BA 11285 (Jesus Manuel, booking 17825, bed 83): ended 5 Jul 2026 — 24d stale, active=true, fee=null
BA 11352 (Veronica Martin, booking 18156, bed 83): ended 11 Jul 2026 — 18d stale, active=true
Dates in DB (21 Jun to 5 Jul) differ from requested (20 Jun to 4 Jul) by 1 day — likely DST off-by-one migration artefact.

Fix recipe (NOT YET RUN):
Same fix as Issue 37:
  UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352);
Optional date correction for BA 11285 (only if Neil confirms and not yet invoiced):
  UPDATE booking_accommodation SET start_date = '2026-06-20', end_date = '2026-07-04' WHERE id = 11285;

Risk: Data hygiene + possible date correction. Reversible. Blast radius: booking 17825 only.

Status: Unchanged from 28 Jul 2026 (12th check). Fix NOT RUN.
Last checked: 2026-07-29 UTC