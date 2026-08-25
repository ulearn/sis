Issue 53 — Fanny Scelles — Multi-Host Accommodation Template Gap
Reporter: KC | Area: Booking / Accomm | Sheet row 55

Root cause (474th run, 23 Aug 2026 UTC)
No change since 472nd run. Confirmed from fresh DB:
- Student Fanny Scelles (14451), booking 17843
- BA 11267: bed 23, 29 Aug – 4 Oct 2026, fee = EUR 3,840 — Host 1, fee OK
- BA 11399: bed 54, 4 Oct – 19 Dec 2026, fee = null — Host 2, fee missing
- Student arrives 29 Aug (6 days) at bed 23 — BA 11267 is fine
- BA 11399 (fee-null) does not start until 4 Oct (42 days away)

Issue: SIS confirmation email only covers single-host scenarios.

Fix recipe (NOT YET RUN)

Immediate (before 29 Aug):
1. Set fee on BA 11399 (see issue-52-addendum-23aug-c.md)
2. Manually send host confirmation emails to each host separately using single-host template

Longer term: Neil to spec multi-host booking template before implementation.

Risk / Category
- Category: bookings / feature gap (code)
- Blast radius: any student with 2+ hosts; edge case
- Arrival at bed 23 is 29 Aug; BA 11399 (bed 54) starts 4 Oct — not an immediate risk

Status: AWAITING SPEC; fee fix on BA 11399 NOT RUN
Last checked: 2026-08-23 UTC (474th run)