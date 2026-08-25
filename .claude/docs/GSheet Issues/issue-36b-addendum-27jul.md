Issue 36b -- Stale Booking Accommodations + Pietro Xero
Reporter: Various | Area: Booking / Accomm | Sheet row 38

Root cause (Mon 27 Jul 2026):
- Stale BAs (active=true, end past, bed assigned): 47 -- up from 42 (Sat Jul 25), +5 in 2 days
- 5 new stale BAs since Jul 25:
    BA 29 (Martina Tartaro, bed 177, ended Jul 26)
    BA 26 (Jade Ribeiro, bed 178, ended Jul 25)
    BA 11312 (bed 161, bk 17984, ended Jul 25)
    BA 11184 (bed 188, bk 78, ended Jul 25)
    BA 11366 (bed 189, bk 18212, ended Jul 25)
- Pietro BA 11311 (Jun 28-Sep 13): dates correct -- RESOLVED
- Pietro pmt 17733: EUR 5331, xeroPaymentId=null, type=null -- 55 days since Jun 3 2026

Fix recipe (NOT YET RUN):
Step 1: Deactivate all 47 stale BAs:
  UPDATE booking_accommodation SET active = false
  WHERE active = true AND bedId IS NOT NULL AND endDate < 2026-07-27;
  Expected: 47 rows

Step 2: Reconcile Pietro pmt 17733 in Xero:
  1. Log in to Xero
  2. Find invoice for booking 17980 (Pietro Caccianiga, EUR 5331)
  3. Mark payment as reconciled; update xeroPaymentId

Risk: data-hygiene (BAs) + money (Pietro Xero) | Reversible yes
Urgency: Moderate -- BA count growing; Pietro Xero 55d overdue

Status: OPEN -- 116th hrly Mon 27 Jul 2026 UTC. Fix NOT RUN.
Last checked: 2026-07-27 UTC