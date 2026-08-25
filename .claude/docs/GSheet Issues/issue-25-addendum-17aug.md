Issue 25 - Uyanga Tungalag / Visa Null + No Class (Day 112)
Reporter: PG | Area: Visa / Class | Sheet row: 26

Symptom: Visa status not set; student not in class for 112 days. EUR 661 payment gap.

Root cause (evidence)
- Student 917 (Uyanga Tungalag): visaStatus=null, hubspotContactId=null -- updated 28 Jul 2026
- Booking 1467: CONFIRMED, confirmed=true, amountPaid=EUR 2405, amountOpen=EUR 0
- BC 1613 (Academic Year Morning): 27 Apr to 30 Oct 2026, active=true, 0 SCAs -- Day 112; 74 days remaining
- Payment 17258: EUR 3066, TransferMate Escrow, xeroPaymentId=null -- 101 days unreconciled (paid 8 May 2026)
- EUR 3066 paid vs amountPaid EUR 2405 = EUR 661 discrepancy

Fix recipe -- NOT YET RUN
  UPDATE Student SET visaStatus=APPROVED WHERE id=917;
  -- Link HubSpot: UPDATE Student SET hubspotContactId=HS_CONTACT_ID WHERE id=917;
  INSERT INTO StudentClassAssignment (bookingCourseId, classId, weekStart, weekEnd)
    VALUES (1613, CLASS_ID, CURRENT_DATE, 2026-10-30);
  -- Manual Xero: reconcile EUR 3066 TransferMate (8 May 2026) to booking 1467

Info needed:
1. EUR 661 gap -- full payment or partial allocation in HubSpot/Xero?
2. Which AM class for Uyanga?
3. HubSpot contact ID for Uyanga Tungalag.
Risk: Visa/bookings/money -- reversible (except Xero). Blast radius: student 917, payment 17258.
Status: Open -- fix NOT RUN. Day 112 without class.
Last checked: 2026-08-17 UTC (164th check)