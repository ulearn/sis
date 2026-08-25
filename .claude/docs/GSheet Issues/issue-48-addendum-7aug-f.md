Issue 48 Multiple Students Stale BCs Orphaned Payments Name Check (71st hourly check Fri 7 Aug 2026 UTC)
Reporter: AC | Area: Attendance/classes | Sheet row: 50

Symptom: Multiple class assignment and attendance issues; orphaned payments; possible name spelling error Fassina vs Fassini.

Root cause (live data, 71st check UNCHANGED):
Name issue: Student 14462 stored as Francesca Fassina (email: francescafassina98@gmail.com), hubspotContactId=769644314873.
  Email contains Fassina - issue raised as possibly Fassini. Needs HubSpot verification.

Orphaned payments:
  Payment 16988: EUR 339.90 Bank 28 Apr 2026 - bookingId=null (unlinked)
  Payment 16989: EUR 339.90 Bank 28 Apr 2026 - bookingId=null (unlinked)
  Both should link to bookings 17856 or 17857. Also tracked in Issue 1.

Booking anomalies:
  Booking 17856 (student 14461): CONFIRMED confirmed=false amountPaid=339.90
  Booking 17857 (student 14462 Fassina): CONFIRMED confirmed=false amountPaid=339.90

Stale Booking Courses:
  BC24630 (General English AM Plus BK17857): ended 10 Jul 2026 active=true - 28 days stale
  BC24631 (General English AM Plus BK17856): ended 10 Jul 2026 active=true - 28 days stale

Fix recipe (NOT YET RUN):
  Step 1: Verify name in HubSpot (contact 769644314873). If Fassini:
    await p.student.update({where:{id:14462},data:{lastName:"Fassini"}});
  Step 2: Link orphaned payments (verify order by date):
    await p.payment.update({where:{id:16988},data:{bookingId:17856}});
    await p.payment.update({where:{id:16989},data:{bookingId:17857}});
  Step 3: Update bookings:
    await p.booking.update({where:{id:17856},data:{confirmed:true,amountPaid:339.90,amountOpen:0}});
    await p.booking.update({where:{id:17857},data:{confirmed:true,amountPaid:339.90,amountOpen:0}});
  Step 4: Deactivate stale BCs:
    await p.bookingCourse.updateMany({where:{id:{in:[24630,24631]}},data:{active:false}});

Risk: Bookings/Money/Data-hygiene - reversible 2 students. Name change verify HubSpot first.
Status: Not run. 71st hourly check unchanged. Last checked: Fri 7 Aug 2026 UTC