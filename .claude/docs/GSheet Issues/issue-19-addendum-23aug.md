Issue 19 addendum 470th check Sun 23 Aug 2026
Mai Lan Chu -- BC 89+90 stale 93d, EUR 2,385 payment gap

Root cause:
- BC 89 Morning IELTS: ended 2026-05-22, active=true -- 93d stale, 1 SCA.
- BC 90 Private Lessons: ended 2026-05-22, active=true -- 93d stale, 0 SCAs.
- Booking 83: CONFIRMED, confirmed=true, amtPaid=EUR 2,629.80, amtOpen=EUR 0.
- Payment anomaly (total EUR 5,014.80 vs amountPaid EUR 2,629.80 -- EUR 2,385 gap):
  Payment 27: EUR 2,135, Bank Transfer, 19 Mar 2024, xeroId null (likely migration artifact).
  Payment 17002: EUR 2,629.80, TransferMate, 8 Apr 2026, xeroId null.
  Payment 17019: EUR 250, Stripe, 12 Feb 2026, xeroId null.
- BCs now 93d stale (was 91d on Fri 21 Aug). Data otherwise unchanged.

Fix NOT YET RUN:
1. Deactivate BC 89 and BC 90 (pre-check: BC 89 SCA is historical, not active current).
2. Investigate EUR 2,385 gap -- payment 27 (EUR 2,135, Mar 2024) likely migration duplicate; check booking_id lineage before any change.
3. Reconcile 3 Xero-null payments once ownership confirmed.

Risk: bookings/money -- EUR 2,385 gap needs investigation before payment changes. BC deactivation low risk. Blast radius: 2 BCs, 3 payments.
Status: Open -- 93d stale. Fix NOT RUN.
Last checked: 2026-08-23 UTC (470th run)
