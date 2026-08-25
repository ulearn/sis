Issue 20 Ariunsarnai Batbayar EUR 1509 Unpaid Day 117 (39th hourly check Fri 7 Aug 2026 UTC)
Reporter: PG | Area: Booking/Class | Sheet row: 21 | SIS: 1047 | Deal: 1605

Symptom: Student not appearing in to-be-assigned queue - says payment due.

Root cause (live data, 39th check UNCHANGED):
- Student 1047 (Ariunsarnai Batbayar): hubspotContactId=780356561119, visa=null
- Booking 1605: status=PENDING, confirmed=false, amountPaid=EUR 0, amountOpen=EUR 1509
- Zero payments linked to booking 1605
- Booking Course 1791 (Academic Year Renewal Morning): 13 Apr - 23 Oct 2026, active=true
- Course started 13 Apr 2026 - student is day 117 without class assignment

Fix recipe (NOT YET RUN):
1. Check HubSpot deal 1605 for payment status.
   If paid: create payment record, link to booking 1605, set confirmed=true.
   If not paid: contact student/agent re EUR 1509 outstanding.
2. If payment confirmed:
   await p.payment.create({data:{bookingId:1605,amount:1509,method:"Bank",createdAt:new Date("YYYY-MM-DD")}});
   await p.booking.update({where:{id:1605},data:{status:"CONFIRMED",confirmed:true,amountPaid:1509,amountOpen:0}});
3. After booking CONFIRMED, student appears in assignment queue.

Risk: Money/Bookings - requires HubSpot/accounts verification first. Reversible.
Status: Not run. Day 117, still PENDING. Last checked: Fri 7 Aug 2026 UTC