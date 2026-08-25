# Issue 36 — Pietro Caccianiga (Student 14521) — Addendum 15 Aug 2026

**Reporter:** AC  
**Area:** Booking / Accommodation  
**Sheet row:** 38  

---

## Symptom
Student paid for 11 weeks of accommodation (Jun 28 – Sep 13). Accommodation dates could not be changed in SIS.

## Current State (191st check — Sat 15 Aug 2026 UTC)

### Booking 17980
- Status: CONFIRMED, confirmed = true
- Amount paid: EUR 5,331 | Amount open: EUR 0 (fully settled)

### Booking Accommodation 11393
- Bed: 88 | Dates: Aug 22 – Sep 13 2026 | Fee: **NULL** | Active: true
- Last updated: 2026-08-10 (5 days ago)
- Check-in: **7 days** (Aug 22)

### Payment 17733
- Amount: EUR 5,331 | Method: Bank | Date: 2026-06-02
- xeroPaymentId: **null** (73 days unreconciled in Xero)
- transactionId: null

### Changes since yesterday
- BA 11393 fee still null — unchanged
- Payment 17733 xero reconciliation still pending (now 73 days)
- Check-in countdown: 7 days (was 8)

---

## Fix Recipe (NOT YET RUN)

### 1. Confirm fee with Diego, then set on BA 11393
SIS admin → Booking 17980 → Accommodation tab → BA 11393 (bed 88, Aug 22–Sep 13):
- Confirm expected fee (11 weeks × weekly rate = ? — Diego to confirm)
- Set fee and save

### 2. Reconcile Payment 17733 in Xero (73 days overdue)
- Log in to Xero → find the EUR 5,331 Bank payment dated 2026-06-02
- Match to Invoice for Booking 17980 / Student 14521 (Pietro Caccianiga)
- Update xeroPaymentId in SIS if not auto-synced

---

## Risk / Category
- **Category:** Bookings / Accommodation + Accounts
- **Reversible:** Yes
- **Blast radius:** Single student; fully paid booking
- **Time risk:** Fee must be set before Aug 22 check-in (7 days)

---

## Status
OPEN — fee null on BA 11393 (check-in 7 days); Payment 17733 unreconciled in Xero (73 days)  
**Last checked:** 2026-08-15 UTC (191st check)