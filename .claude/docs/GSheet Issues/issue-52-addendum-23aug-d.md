# Issue 52 — Fanny Scelles BA 11399 Fee Null (484th run, Sun 23 Aug 2026 UTC)

Reporter: KC | Area: Booking / Accomm | Sheet row: 54

## Root cause (no change from 474th run)
- Student 14451 (Fanny Scelles), booking 17843: CONFIRMED, paid=EUR 5,595.16, total=EUR 5,595.16
- BA 11267 (bed 23, Host Family, Individual, Half Board): 2026-08-29 to 2026-10-04, fee=EUR 3,840 — ARRIVES IN 6 DAYS
- BA 11399 (bed 54, Host Family, Individual, Half Board): 2026-10-04 to 2026-12-19, fee=null — STILL MISSING
- BC 24617 (General English AM): starts 2026-08-31, active=true
- No historical BAs on bed 54; fee must come from host agreement
- Fix NOT RUN

## Fix recipe (NOT YET RUN)

Fix 1 — Set fee on BA 11399 (4 Oct – 19 Dec = 76 days = 10.86 weeks; check host rate):
  UPDATE booking_accommodations SET fee = <weekly_rate * 10.86> WHERE id = 11399;

Fix 2 — Verify host for BA 11267 (bed 23) has been notified of arrival 29 Aug.
  If not sent, send host confirmation now — arrival is 6 days away.

Fix 3 (code) — Multi-host email template: see issue-52-host-email-badge.md for spec.

## Risk / category
- Category: bookings / data-hygiene (fee); code (template)
- Reversible: yes for fee | Blast radius: Fanny only (fee); all host emails (template)
- ARRIVAL at bed 23 on 29 Aug (6 days)

Status: OPEN — Fix NOT RUN
Last checked: 2026-08-23 UTC (484th run)