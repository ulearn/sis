Issue 18 - Flavia Nascimento Mariano - Visa Status Null Day 78 (341st run)
Row: 19  Run: 341st Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB)
- Student 983 (Flavia Nascimento Mariano): visa_status=null, student updated 2026-07-28
- Booking 1534: CONFIRMED, confirmed=true, amountPaid=EUR 1,308, amountOpen=EUR 0 (updated 2026-08-10)
- BC 1710 (AY Afternoon): 2026-06-01 to 2026-11-27, active=true
- SCA 265: class 11, 2026-06-15 to 2026-11-20 -- student IS in class and attending
- Payment 17527: EUR 1,058, Bank, 2026-05-19 -- xeroPaymentId=null (unreconciled)
- Payment 17035: EUR 250, Bank Transfer, 2026-02-17 -- xeroPaymentId=null (unreconciled)
- visa_status null for 78 days; blocked from to-be-assigned view

FIX (NOT YET RUN):
  await p.student.update({where:{id:983},data:{visaStatus:"APPROVED"}});
  // Then reconcile Payments 17527+17035 Xero IDs via Hub fins/

RISK: reversible. 1 student.
Last checked: 2026-08-17 (341st hourly run)