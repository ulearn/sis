# Issue 41 addendum — 29th hourly Tue 21 Jul 2026 UTC

Status: UNCHANGED. Capel accommodation missing. Payment 17954 Xero ID = null.
Check-in 2 Aug 2026 is 12 days away.

Booking 18180 | Giampaolo Russo | s14571
Payment 17954: EUR 2584.96 Bank Transfer, created 29 Jun 2026 — xeroPaymentId = null (22 days unreconciled)
BA 11357: bed 178 (Patty McSweeney, Glasnevin), 2 Aug - 6 Sep 2026, active=true, fee=EUR 1250
BC 24956: General English AM, 3 Aug - 11 Sep 2026, fee=EUR 804.96
Fee total in SIS: EUR 804.96 + EUR 1250 = EUR 2054.96
Amount paid: EUR 2584.96 — gap of EUR 530 unaccounted for
Capel Street apartment accommodation entry is MISSING from SIS (covers 6 Sep - 14 Sep 2026 per original issue)

Fix recipe (NOT YET RUN):
1. Add booking accommodation for Capel Street apartment to booking 18180
   Dates: 6 Sep 2026 - 14 Sep 2026 (1 week + 1 night per original issue report)
   Fee should account for the EUR 530 gap (confirm exact amount with Diego)
2. Reconcile payment 17954 (EUR 2584.96) in Xero — set xeroPaymentId

Risk: accommodation/payment. Reversible. Check-in 2 Aug = 12 days.
Last checked: Tue 21 Jul 2026 UTC (29th hourly, 80th check).