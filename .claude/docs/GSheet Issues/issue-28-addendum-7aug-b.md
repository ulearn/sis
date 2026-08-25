Issue 28 Paola Sthefane Moreira confirmed=false Payment Unreconciled 76 Days (41st hourly check Fri 7 Aug 2026 UTC)
Reporter: pg | Area: booking/class | Sheet row: 29 | SIS: 14456 | Deal: 17850

Symptom: Student appears in class list but cannot be assigned - payment not received shown.

Root cause (live data, 41st check UNCHANGED):
- Booking 17850 (Paola Sthefane Missias Moreira, student 14456):
  status=CONFIRMED, confirmed=false (anomaly)
  amountPaid=null (should be EUR 321.35)
  amountOpen=EUR 321.35 (should be 0)
- Payment 17519: EUR 321.35, Bank, 23 May 2026 - bookingId=17850 (linked), xeroPaymentId=null
  Payment IS linked to booking; booking amounts not updated - 76 days unreconciled
- Booking Course 24624 (Morning General): ended 5 Jun 2026, active=true - 63 days stale

Fix recipe (NOT YET RUN):
  await p.booking.update({where:{id:17850},data:{confirmed:true,amountPaid:321.35,amountOpen:0}});
  await p.bookingCourse.update({where:{id:24624},data:{active:false}});
  Then reconcile payment 17519 in Xero (manual step - xeroPaymentId is null).

Risk: Money/Bookings - low risk, payment already exists and is linked. Reversible.
Status: Not run. 76 days since payment, booking still shows confirmed=false. Last checked: Fri 7 Aug 2026 UTC