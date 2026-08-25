Issue 41 - Giampaolo Russo (Addendum 25 Jul 2026 F)
Reporter: Diego | Area: Booking / Accomm | Sheet row: 43

Symptom: Student booked two types of accommodation (host family + Capel St apartment).
Capel St apartment never added to SIS. Student not appearing in host-family matching.

Current status (67th hourly, Sat 25 Jul 2026 UTC)
- Student 14571 Giampaolo Russo: visaStatus = null (last DB update 11 Jul, 14d ago)
- Booking 18180: CONFIRMED, fully paid EUR 2,584.96
- Booking course 24956: General English AM, Aug 3 to Sep 11 2026, active = true
  (Note: BC 24956 starts Aug 3 = Bank Holiday - needs shunting per Issue 38)
- Booking accommodation 11357: Aug 2 to Sep 6, bed 178 (Patty McSweeney, Glasnevin), EUR 1,250
- Capel Street apartment BA: STILL MISSING - only 1 BA record exists for BK 18180
- Amount gap: EUR 2,584.96 paid vs EUR 1,250 (accomm) + EUR 804.96 (course fees) = EUR 529.96 unaccounted
  => EUR 529.96 is almost certainly the Capel apartment fee (Sep 6 to Sep 14, 8 nights)
- Payment 17954: EUR 2,584.96 Bank, 29 Jun 2026; xeroPaymentId = null, transactionId = null
  Xero not reconciled = 26 days

HOST FAMILY CHECK-IN: Aug 2 2026 = 8 calendar days away

Fix recipe (NOT YET RUN)

Step 1 - Confirm Capel details with Diego (dates: Sep 6 to Sep 14; fee: approx EUR 530)

Step 2 - Create missing Capel BA in SIS admin:
  Booking 18180 -> Add Accommodation -> Capel Street -> Room type -> Sep 6 to Sep 14 2026 -> fee EUR 529.96

Step 3 - Set visaStatus on student 14571 to unblock host-family matching:
  SIS Admin -> Student 14571 -> Personal Details -> set Visa Status appropriately

Step 4 - Reconcile payment 17954 in Xero (EUR 2,584.96 bank transfer, 29 Jun 2026)

Step 5 - Note: BC 24956 starts Aug 3 (BH) - shunt to Aug 4 when running Issue 38 fix

Risk: bookings/accomm/accounts; reversible; single booking; urgent (host check-in Aug 2 = 8d)

Status: OPEN - Capel BA still missing; Xero null 26d; visaStatus null 14d.
Last checked: Sat 25 Jul 2026 UTC (67th hourly)