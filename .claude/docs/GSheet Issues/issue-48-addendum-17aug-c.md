Issue 48 - Telmuun Enkhsaikhan Group - Payment Gap + No SCA (341st run)
Row: 50  Run: 341st Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB, student 293)
- Booking 1624: PARTIAL, confirmed=false, amountPaid=EUR 1,406, amountOpen=EUR 250
- BC 1810 (AY Renewal Morning): 2026-06-29 to 2027-01-01, active=true, 0 SCAs -- day 49
- Only 1 payment linked: Payment 17956, EUR 100, Bank, 2026-03-31, xeroPaymentId=null
- amountPaid=EUR 1406 vs EUR 100 linked -- EUR 1,306 unaccounted in payment records
- Booking 467: amountPaid=220, payment 259 amount=EUR 2785 (migration anomaly)
- Booking 1466: amountPaid=1784.50, payment 884 amount=EUR 220 (migration anomaly)

FIX (NOT YET RUN):
  Step 1: Investigate -- check all payments for student 293 across bookings
  const bks=await p.booking.findMany({where:{studentId:293},
    select:{id:true,amountPaid:true,payments:{select:{id:true,amount:true,paymentDate:true}}}});
  Step 2: Determine correct classId, then create SCA on BC 1810
  Step 3: Settle EUR 250, then set booking 1624 confirmed=true

RISK: payments/bookings -- EUR 1,306 gap needs investigation before writes.
See also: issue-48-addendum-17aug-b.md (from 07:13 UTC today)
Last checked: 2026-08-17 (341st hourly run)