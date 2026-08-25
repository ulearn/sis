# Issue 53 — Multi-Accommodation Host Template (484th run, Sun 23 Aug 2026 UTC)

Reporter: KC | Area: Booking / Accomm | Sheet row: 55

## Symptom
Host booking confirmation template does not support multiple accommodation periods.

## Root cause
Same data as issue 52 — Fanny Scelles (student 14451), booking 17843:
- BA 11267 (bed 23): 2026-08-29 to 2026-10-04, fee=EUR 3,840 — arrives in 6 days
- BA 11399 (bed 54): 2026-10-04 to 2026-12-19, fee=null — second stay, no fee
Two fixes needed: (1) fee data entry on BA 11399; (2) code fix for multi-host template.

## Fix recipe (NOT YET RUN)

Fix 1 (data) — Set fee on BA 11399:
  UPDATE booking_accommodations SET fee = <agreed_rate> WHERE id = 11399;

Fix 2 (code) — Template spec for multi-host stays: see issue-52-host-email-badge.md.
  Neil to spec before implementing.

## Risk / category
- Category: bookings (fee = data-hygiene); code (template = medium scope)
- Reversible: yes (fee) | Blast radius: Fanny only (fee); all multi-host bookings (template)

Status: OPEN — fee fix NOT RUN; template spec open
Last checked: 2026-08-23 UTC (484th run)