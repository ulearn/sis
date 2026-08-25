Issue 1 Orphan Payments 182nd check Fri 7 Aug 2026

Orphan payments unchanged: 16988 EUR 339.90, 16989 EUR 339.90, 17187 EUR 6151, 4781 EUR 380.
BCs 24630+24631 ended Jul 10 2026, active=true, 28d stale.
Bks 17856+17857: CONFIRMED confirmed=false.

Fix (NOT YET RUN):
await p.payment.update({where:{id:16988},data:{bookingId:17856}});
await p.payment.update({where:{id:16989},data:{bookingId:17857}});
await p.booking.update({where:{id:17856},data:{confirmed:true,amountPaid:339.90,amountOpen:0}});
await p.booking.update({where:{id:17857},data:{confirmed:true,amountPaid:339.90,amountOpen:0}});
await p.bookingCourse.updateMany({where:{id:{in:[24630,24631]}},data:{active:false}});
Payment 17187 escrow: verify Hub fins before linking.
Risk: Money/Bookings reversible.
Last checked: Fri 7 Aug 2026 UTC