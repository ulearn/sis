# Issue 41 addendum -- 32nd hourly Tue 21 Jul 2026 UTC (84th check)

Status: UNCHANGED. Capel accommodation missing. Payment 17954 Xero ID = null. Check-in 12 days.

Booking 18180 | Giampaolo Russo | s14571
CONFIRMED | amountTotal = EUR 2584.96 | amountPaid = EUR 2584.96 | amountOpen = EUR 0 | updated 29 Jun 2026

Payment 17954: EUR 2584.96 | Bank Transfer | paymentDate 26 Jun 2026 | xeroPaymentId = null (25 days unreconciled)

Accommodations on booking 18180 (confirmed this run):
BA11357 | bed 178 | Patty McSweeney (Glasnevin, host family) | 2 Aug-6 Sep 2026 | fee EUR 1250 | active = true
(No Capel Street accommodation found)

Booking course:
BC24956 | General English AM | 3 Aug-11 Sep 2026 | fee EUR 804.96

Fee reconciliation:
  Course EUR 804.96 + Accommodation EUR 1250.00 = EUR 2054.96
  Amount paid: EUR 2584.96 | Gap: EUR 530.00 (Capel apartment missing from SIS)

Fix recipe (NOT YET RUN):
1. Add booking accommodation (Capel Street apartment) to booking 18180
   Dates: 6 Sep 2026 - 14 Sep 2026 (confirm exact checkout date with Diego)
   Fee: EUR 530 (confirm exact amount) | Accommodation type: apartment
2. Reconcile payment 17954 in Xero -- find/create matching Xero payment record and set xeroPaymentId

Risk: accommodation/payment. Reversible. Check-in: 2 Aug 2026 -- 12 calendar days away.
Last checked: Tue 21 Jul 2026 UTC (32nd hourly, 84th check).