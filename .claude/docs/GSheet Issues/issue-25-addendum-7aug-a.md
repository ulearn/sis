Issue 25 Uyanga Tungalag Visa Null 0 Class Assignments Day 102 (151st hourly check Fri 7 Aug 2026 UTC)
Reporter: pg | Area: visa/class | Sheet row: 26 | SIS: 917 | Deal: 1467

Symptom: Visa status not selectable; student not appearing in class-to-be-assigned queue.

Root cause (live data, 151st check UNCHANGED):
- Student 917 (Uyanga Tungalag): visaStatus=null, hubspotContactId=null
- Booking 1467: status=CONFIRMED, confirmed=true, amountPaid=EUR 2405, amountOpen=EUR 0 (fully paid)
- Booking Course 1613 (Academic Year Morning): 27 Apr - 30 Oct 2026, active=true
- 0 class assignments (classAssignments=[])
- Course started 27 Apr 2026 - student is day 102 without class assignment

Fix recipe (NOT YET RUN):
  await p.student.update({where:{id:917},data:{visaStatus:"approved"}});
  await p.student.update({where:{id:917},data:{hubspotContactId:"<contactId>"}});
  Then assign BC 1613 to class via SIS Admin Classes Assign (manual UI step).

Risk: Data hygiene/Bookings - low risk; booking fully paid, visa update is reversible.
Status: Not run. Day 102, 0 SCAs, visa still null. Last checked: Fri 7 Aug 2026 UTC