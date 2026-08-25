# Issue 36 — Pietro Caccianiga (Student 14521)

**Reporter:** KC | **Area:** Booking / Accomm | **Sheet row:** 38
**Last checked:** 2026-08-18 UTC (220th check)

## Root cause (evidence from live DB)

- Booking 17980: CONFIRMED, fully paid EUR 5,331, amountOpen = 0
- Booking Accommodation 11311: bed 84, 28 Jun to 22 Aug 2026, fee EUR 3,850, active — checkout Sat 22 Aug (4 days)
- Booking Accommodation 11393: bed 88, 22 Aug to 13 Sep 2026, fee = null, active — check-in Sat 22 Aug (4 days)
- Payment 17733: EUR 5,331, 2 Jun 2026, xeroPaymentId = null (78 days unreconciled)

## Fix recipe (NOT YET RUN)

### Step 1 — Backup
SELECT id, start_date, end_date, fee, active, bed_id FROM booking_accommodations WHERE booking_id = 17980;
SELECT id, amount, payment_date, xero_payment_id FROM payments WHERE booking_id = 17980;

### Step 2 — Set fee on BA 11393
Determine from contract: total EUR 5,331 less course fees less BA 11311 (EUR 3,850). Then:
UPDATE booking_accommodations SET fee = <calculated_amount> WHERE id = 11393;

### Step 3 — Reconcile Payment 17733 in Xero
xeroPaymentId = null (78d). Match to Xero invoice via Hub fins/ or Xero UI.

### Step 4 — Deactivate BA 11311 on checkout (Sat 22 Aug)
UPDATE booking_accommodations SET active = false WHERE id = 11311;

### Step 5 — Verify
SELECT id, start_date, end_date, fee, active FROM booking_accommodations WHERE booking_id = 17980 ORDER BY start_date;

## Risk / category
- accommodation | financial + data integrity | reversible | blast radius: 1 student
- URGENCY: HIGH — check-in Sat 22 Aug (4 days); fee must be set before then

## Status
Open — fee null on BA 11393, Xero unreconciled. 4 days to check-in.
**Last checked:** 2026-08-18 UTC