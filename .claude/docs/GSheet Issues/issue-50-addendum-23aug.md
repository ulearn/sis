# Issue 50 — Stale Booking Accommodations (count: 157/158)

Reporter: KC | Area: Booking / Accomm | Sheet row: 52

Last checked: 488th run, Sun 23 Aug 2026 UTC ~22:15

## Count history

- Run 463 (Sat 22 Aug, evening): 151 stale (endDate <= Aug 22)
- Run 487 (Sun 23 Aug, ~21:15): reported 151 — slightly different cutoff
- Run 488 (Sun 23 Aug, ~22:15): 157 stale (2026 BAs, endDate < Aug 23T00:00Z); 158 including today

The 6-item jump from 151 to 157: likely a cutoff boundary methodology difference between runs.
Both use the 2026 gte filter. The correct current count is 157 (<Aug 23) or 158 (including Aug 23).

## Today checkout — BA 11372

- Booking Accommodation 11372, booking 18225, bed 186
- Start: 2026-08-02, End: 2026-08-23, Fee: EUR 750, active = true
- Will be 158th stale by midnight UTC tonight

## Fix recipe (NOT YET RUN)

Same as issue-50-addendum-22aug-c.md. Update boundary date to Aug 24:

  const boundary = new Date("2026-08-24T00:00:00.000Z");

Risk: data-hygiene | Reversible: yes (set active=true) | Blast radius: 158 rows