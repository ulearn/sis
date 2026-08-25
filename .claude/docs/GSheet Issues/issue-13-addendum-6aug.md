Issue 13 addendum 6 Aug 2026 -- Lizbeth del Carmen Sierra Martinez health insurance
Root Cause (Thu 6 Aug UTC)
  Student 14522: insurance_from=null, insurance_until=null, visa_status=null
  Booking 17981: CONFIRMED, confirmed=false, EUR 1407.50 paid, amount_open=null
  Service 2026-05-25 to 2027-01-22. BC 24773 (Acad Year Afternoon, Jun 1 2026 - Jan 29 2027): active (running)

Fix Recipe (NOT YET RUN)
  Confirm insurance dates with student/agency first
   UPDATE students SET insurance_from='2026-06-01', insurance_until='2027-01-29' WHERE id=14522;
   UPDATE bookings SET confirmed=true WHERE id=17981;

Risk: documents/data-hygiene | Reversible | Low (1 student)
Status: Unchanged. Last checked: Thu 6 Aug 2026 UTC (44th check, 66 days since Jun 1)
