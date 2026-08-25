# Issue 1 — Orphan payments + stale BCs/BAs (32nd hourly, Tue 21 Jul 2026)

**Reporter:** NM  **Area:** Cleanup  **Sheet row:** 2

## Status check (32nd hourly, 88th check)

Orphan payments (bookingId = null) — UNCHANGED:
- pmt 16988: EUR 339.90, Bank, 28 Apr 2026, type=one_time_or_initial — 84 days
- pmt 16989: EUR 339.90, Bank, 28 Apr 2026, type=one_time_or_initial — 84 days
- pmt 17187: EUR 6151, TransferMate Escrow, 1 May 2026, type=null — 81 days
- pmt 4781: EUR 380, Flywire, 20 Aug 2019, type=null — legacy

Stale booking courses: **24,436** (active=true, ended before Jul 21)
Stale booking accommodations: **11,175** (active=true, ended before Jul 21)

## Fix recipe (NOT YET RUN)

### Orphan payments:
Identify bookings via HubSpot then:
  UPDATE payments SET booking_id = X WHERE id IN (16988, 16989);
  UPDATE payments SET booking_id = Y WHERE id = 17187;
  -- pmt 4781: investigate with accounts, likely archive

### Stale deactivation:
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < NOW();
  UPDATE booking_accommodations SET active = false WHERE active = true AND end_date < NOW();
  -- Run in transaction; SELECT COUNT(*) first to verify

**Status: OPEN — Fix NOT RUN**
**Last checked:** Tue 21 Jul 2026 UTC (32nd hourly, 88th overall)
