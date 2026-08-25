# Issue 41 --- Giampaolo Russo --- Capel Apt Missing, Xero Null, Check-In Aug 2
Reporter: KC | Area: Booking / Accomm | Sheet Row 43

## Root Cause (67th hourly check, Thu 23 Jul 2026 UTC --- 145th total)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED
- Accommodation 11357: Host Family, 2 Aug - 6 Sep 2026, active = true, bed assigned, fee = EUR 1,250
- Capel Street apartment (6-14 Sep 2026): NOT present in booking_accommodations
- Payment 17954 (EUR 2,584.96, Bank): xeroPaymentId = null --- STILL unreconciled
- Check-in is 2 Aug 2026 --- 10 days away

Status: DATA UNCHANGED from prior runs.

## Fix Recipe (NOT YET RUN)

Step 1 - Add Capel Street apartment to booking 18180 via SIS admin:
  Type: Apartment (Capel Street), Start: 6 Sep 2026, End: 14 Sep 2026
  Fee: EUR 1,334.96 (inferred: 2,584.96 - 1,250; verify with Diego/KC before entering)

Step 2 - Reconcile Xero payment 17954:
  Find matching payment in Xero then:
  UPDATE payments SET xero_payment_id = <xero_id> WHERE id = 17954; -- NOT YET RUN

## Risk
- bookings, money (Xero); reversible; 1 student

## Status
OPEN --- Check-in Aug 2 (10 days). Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC (67th hourly, 145th total)