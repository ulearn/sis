# Issue 48 — Multiple Students: Class Assignment + Attendance — 3 Aug 2026 UTC
Reporter: AC | Area: Attendance/Classes | Sheet row: 50

Root cause (all unchanged):
- BC 24630 (Galbusera, General English AM Plus): endDate=2026-07-10, active=true — 24d stale
- BC 24631 (Fassina, General English AM Plus): endDate=2026-07-10, active=true — 24d stale
- Payment 16988: EUR 339.90, bookingId=null, xeroPaymentId=null
- Payment 16989: EUR 339.90, bookingId=null, xeroPaymentId=null
- Booking 17856 (Galbusera): CONFIRMED, confirmed=false, amountPaid=339.90
- Booking 17857 (Fassina): CONFIRMED, confirmed=false, amountPaid=339.90

Fix recipe (NOT YET RUN):
Step 1 - Deactivate BCs: p.bookingCourse.updateMany({where:{id:{in:[24630,24631]}},data:{active:false}})
Step 2 - Link pmts: p.payment.update({where:{id:16988},data:{bookingId:17856}}); p.payment.update({where:{id:16989},data:{bookingId:17857}})
Step 3 - Set confirmed: p.booking.updateMany({where:{id:{in:[17856,17857]}},data:{confirmed:true}})

Risk: bookings/data-hygiene, low blast radius (2 short-term students). Reversible.
Status: OPEN — NOT RUN. Last checked: 2026-08-03 UTC (all unchanged)