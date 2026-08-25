# Issue 41 — Giampaolo Russo: Capel St missing + Xero null (33rd hourly, Tue 21 Jul 2026)

**Reporter:** Diego / Staff  **Area:** Booking / Accomm  **Sheet row:** 43

## Status check (33rd hourly, 85th check)

Booking 18180 (Giampaolo Russo, student 14571):
- Confirmed = true, total = EUR 2584.96, paid = EUR 2584.96, open = EUR 0
- Payment 17954: EUR 2584.96, Bank Transfer, 26 Jun 2026 — **xeroPaymentId = null (25 days unreconciled)**
- BA 11357: bed 178, host family, 2 Aug-6 Sep 2026, fee EUR 1250 — confirmed present
- BC 24956: General English AM, 3 Aug-11 Sep 2026, fee EUR 804.96
- **Capel Street apartment (6 Sep-14 Sep 2026): STILL missing**
- Fee gap: 804.96 + 1250 = 2054.96 vs 2584.96 paid = EUR 530.00 unaccounted
- **Check-in: 2 Aug 2026 — 12 days away**

## Fix recipe (NOT YET RUN)
1. Add Capel Street accommodation to bk 18180: bed = Capel St premium room, dates 6-14 Sep 2026, fee EUR 530 (confirm with accounts)
2. Reconcile payment 17954 in Xero (EUR 2584.96 Bank Transfer 26 Jun 2026)

**Status: OPEN — Fix NOT RUN**
**Last checked:** Tue 21 Jul 2026 UTC (33rd hourly, 85th overall)
