Issue 13 - Lizbeth del Carmen Sierra Martinez (addendum 11 Aug 2026)
Sheet row: 14 | Area: Booking - insurance / visa / payment

Live data (Tue 11 Aug 2026 UTC - 49th check, day 71)
- Student 14522: medicalFrom=null, medicalUntil=null; visaStatus=null; visa dates 1 Jun 2026 to 1 Feb 2027 set
- HubSpot contact 756514173114 linked; student last updated 28 Jul 2026 (14 days ago)
- Booking 17981: CONFIRMED (status), confirmed=false (anomaly), EUR 1,407.50 paid, amountOpen=null
- Booking Course 24773 (AY Afternoon, 1 Jun 2026 to 29 Jan 2027): active, 1 class assignment - student in class

Root cause
Three data-entry gaps: (1) insurance dates never entered; (2) visa_status null despite visa dates present; (3) booking confirmed=false despite payment linked. No system error - all omissions.

Fix recipe (NOT YET RUN)
1. Obtain insurance dates from agent or HubSpot, then:
   UPDATE student SET medical_from='YYYY-MM-DD', medical_until='YYYY-MM-DD' WHERE id=14522;
2. UPDATE student SET visa_status='approved' WHERE id=14522;
3. UPDATE booking SET confirmed=true WHERE id=17981;
4. Reconcile payment 17520 (EUR 1,407.50, Bank, 25 May 2026) in Xero via Hub fins/

Risk
Data-hygiene | Bookings. Reversible. Student is in class - no urgency beyond missing insurance record.

Last checked: Tue 11 Aug 2026 UTC