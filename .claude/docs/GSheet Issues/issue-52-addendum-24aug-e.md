# Issue 52 — Fanny Scelles (BA fee null, arrives Aug 29)

**Area:** Booking / Accommodation  **Sheet row:** 54

## Status update (507th check Mon 24 Aug 2026 UTC)
No change since 506th check (earlier today, Mon 24 Aug).

- Booking Accommodation 11267 (bed 23, 29 Aug – 4 Oct 2026): fee EUR 3,840, active = true — OK
- Booking Accommodation 11399 (bed 54, 4 Oct – 19 Dec 2026): fee = null — NOT SET, 41 days to move-in
- Booking 17843 (Fanny Scelles): CONFIRMED, fully paid EUR 5,595.16
- Fanny ARRIVES 29 Aug 2026 — 5 DAYS AWAY

## Fix recipe (NOT YET RUN)
See issue-52-addendum-24aug-d.md for full fix. Action required:
  1. Confirm accommodation rate for bed 54 (Oct 4 – Dec 19 = 11 weeks) with KC
  2. UPDATE booking_accommodations SET fee = <rate> WHERE id = 11399;

## Status: URGENT — BA11399 fee not set — ARRIVAL Aug 29 (5 days)
**Last checked:** 507th check Mon 24 Aug 2026 UTC