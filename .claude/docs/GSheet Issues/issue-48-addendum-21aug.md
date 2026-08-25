# Issue 48 addendum 21 Aug check 153
Reporter: KC/Paul | Sheet row 50 | Telmuun Enkhsaikhan (student 293)

Current state verified Fri 21 Aug 2026 ~12:00 UTC:
- Booking 1624: confirmed=false, amountTotal=1656, amountOpen=250, amountPaid=1406
- Only 1 payment in DB: ID 17956, EUR 100, paymentDate 2026-03-31, xeroPaymentId=null
- Payment gap: amountPaid=1406 but only EUR 100 in payments table — EUR 1,306 unaccounted
- Booking Course 1810 (Academic Year Renewal Morning): 29 Jun to 1 Jan 2027, active=true, 0 class assignments — day 54
- No change since check 152 (morning UTC). Fix NOT RUN.

Fix recipe (NOT YET RUN):
  Step 1: Investigate via Hub fins/:
    ssh hub@localhost
    cd /home/hub/web/hub.ulearnschool.com/public_html/fins/
    Find payments for booking 1624 / student 293 (Telmuun Enkhsaikhan) in TransferMate/Xero.
  Step 2: Create missing payment records (EUR 1,306) in SIS if found.
  Step 3: Create class assignment on Booking Course 1810 for student 293.
  Step 4: Settle EUR 250 open amount; then set confirmed=true on booking 1624.

Risk: Bookings/Money. Reversible. Blast radius: booking 1624, student 293.
Status: OPEN, Fix NOT RUN. Last checked: 2026-08-21 12:00 UTC (check 153)