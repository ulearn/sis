Issue 41 — Giampaolo Russo Capel BA + Xero Payment (12th check Wed 5 Aug 2026 UTC)
Reporter: Staff | Area: Accommodation/Payments | Sheet row: 43

Root Cause (verified 2026-08-05 UTC — no change since 11th check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2,584.96 fully paid
- Booking course 24956 (General English AM, 2026-08-03 to 2026-09-11): class assignment in place — OK
- Booking accommodation 11357: Host Family (bed 178, Claremont Close), 2 Aug to 6 Sep 2026, active = true, fee = EUR 1,250 — OK
- Capel Street apartment booking accommodation: still absent — provider 15 (Capel Street) has no BA for booking 18180
- Payment 17954: EUR 2,584.96, xero_payment_id = null — 37 days since creation 2026-06-29, still unreconciled

Fix Recipe (NOT YET RUN)
Step 1: Create Capel Street BA in SIS admin — booking 18180, provider 15 (Capel Street), verify dates from HubSpot deal
Step 2: Reconcile payment 17954 (EUR 2,584.96, created 2026-06-29) in Xero against booking 18180 invoice

Verify after fix:
  SELECT id, bed_id, start_date, end_date, active, fee FROM booking_accommodations WHERE booking_id = 18180;

Risk: accommodation, money | Reversible: yes | Blast radius: 1 BA creation, 1 Xero reconciliation
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (12th check) | Payment age: 37 days | Capel BA absent: 37 days