# Issue 20 addendum 23jul-b — Ariunsarnai Batbayar: PENDING Day 101+, EUR 0 / 1509
Addendum: 45th hourly check Thu 23 Jul 2026 UTC (142nd total)
Reporter: PG | Area: Booking / Class | Sheet row 21

## Symptom
Ariunsarnai Batbayar not appearing in to-be-assigned list; booking says payment due.

## Root cause (confirmed this check — fresh DB)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false
- Day 101+ since ~13 Apr 2026 (last updated 23 Jun 2026, 30 days ago)
- Amount paid: EUR 0; amount total: EUR 1,509; amount open: EUR 1,509 — zero payments on file
- No change from previous check (44th hourly, 141st total)

## Fix recipe (NOT YET RUN)
Option A — Chase payment and confirm once received:
  Contact student/agent re EUR 1,509 outstanding
  Once paid, confirm booking 1605 in SIS Admin -> Booking 1605 -> Confirm

Option B — Cancel if no longer coming:
  SIS Admin -> Booking 1605 -> Cancel

## Risk / category
bookings / money; reversible. Single student. EUR 1,509 outstanding for 101+ days.

## Status: OPEN — 101+ days, EUR 0 paid
Last checked: Thu 23 Jul 2026 UTC (45th hourly / 142nd total)
