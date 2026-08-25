# Issue 41 -- Giampaolo Russo (addendum Sat 25 Jul 2026 UTC, 90th hourly run)

Sheet row: 43 | Area: Booking / Accomm | Reporter: KC

Symptom
Student booked Host Family (Aug 2-Sep 6) AND Capel Street apartment (Sep 6-Sep 14). Neither appears in Matching. Capel BA cannot be added.

Current DB state (Sat 25 Jul 2026 UTC -- unchanged)
- Student 14571 Giampaolo Russo: visaStatus = null (last DB update Jul 11 -- 14 days ago)
- Booking 18180: CONFIRMED, amountTotal=EUR 2584.96, amountPaid=EUR 2584.96, amountOpen=0 (fully paid)
- Booking course 24956: General English AM, Aug 3 to Sep 11, active=true, fee=EUR 804.96
- Booking accommodation 11357: Aug 2 to Sep 6, bedId=178 (Patty McSweeney, 5 Claremont Close Glasnevin), active=true, Host Family, fee=EUR 1250
- Capel Street apartment BA: STILL MISSING -- no second BookingAccommodation for BK 18180
- Payment 17954: EUR 2584.96, paymentDate Jun 26, hubspotPaymentId=1268783973563, transactionId=null (29 days, Xero not reconciled)

Amount reconciliation
  Course fee:       EUR 804.96
  Host family fee:  EUR 1250.00
  Total accounted:  EUR 2054.96
  Amount paid:      EUR 2584.96
  Unaccounted:      EUR 530.00 (likely Capel apartment fee -- not confirmed)

Capel Street properties in SIS
  Property id 2:  A1, 32 Capel Street
  Property id 82: A2, 32 Capel Street

Timeline
  Check-in host family: Aug 2 = 8 calendar days away
  Capel move-in: Sep 6 = 42 days away

Fix recipe (NOT YET RUN)

Step 1 -- Confirm Capel details with Diego
  Which property (A1=id 2 or A2=id 82)? Which room/bed? Fee (EUR 530?)? Exact dates (Sep 6-Sep 14)?

Step 2 -- Create missing Capel BA via SIS admin UI
  Booking 18180 -> Accommodation -> Add -> type: Apartment, 32 Capel St, dates Sep 6-Sep 14, fee EUR 530 (TBC)

Step 3 -- Set visaStatus for student 14571
  SIS admin: Student 14571 -> Personal Details -> Visa Status -> Approved -> Save (confirm EU/Italian status first)
  SQL (NOT YET RUN): UPDATE "Student" SET "visaStatus" = 'APPROVED' WHERE id = 14571;

Step 4 -- Reconcile Xero for payment 17954
  Payment EUR 2584.96, Jun 26, transactionId=null -- reconcile via Hub fins/ or SIS payment UI

Risk / category
Moderate. Category: bookings + money. Check-in Aug 2 = 8 days. Capel unallocated. Xero 29 days stale.

Status
OPEN -- Capel BA missing 14+ days. Check-in approaching.

Last checked: Sat 25 Jul 2026 UTC (90th hourly run)