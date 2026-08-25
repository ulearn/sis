Issue 37 addendum 29 Jul 2026
Veronica Martin / bed 83 (BAs 11352 + 11285)
Reporter: KC | Area: Booking / Accomm | Sheet row: 39

Symptom: Student paid for accommodation in Capel — does not appear in SIS for allocation.

Root cause (confirmed):
BA 11285 (Jesus Manuel Ramirez Diaz, booking 17825, bed 83): ended 5 Jul 2026 — 24d stale, active=true, fee=null
BA 11352 (Veronica Martin, booking 18156, bed 83): ended 11 Jul 2026 — 18d stale, active=true, fee=EUR 360
Booking 17825 (Jesus Manuel): CONFIRMED, confirmed=true — no booking anomaly
Booking 18156 (Veronica Martin): CONFIRMED, confirmed=true — no booking anomaly

Fix recipe (NOT YET RUN):
UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352);
Note: BA 11285 has fee=null — confirm with accounts if fee was collected before deactivating.

Risk: Data hygiene. Reversible. Blast radius: bed 83 availability only. Low urgency.

Status: Unchanged from 28 Jul 2026 (9th check). Fix NOT RUN.
Last checked: 2026-07-29 UTC