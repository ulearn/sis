# Issue 41 - Giampaolo Russo accommodation + class assignment
Reporter: Diego/Staff | Area: Booking/Accommodation | Sheet row: 43

Symptom: Host family booked (Aug 2-Sep 6). Capel Street apartment (Sep 6-Sep 14) absent. First class Tue Aug 4.

Root cause (56th check, 11th today - Sun 2 Aug 2026 UTC):
- Student arrived today (Aug 2 2026)
- Booking course 24956 (General English AM, Aug 3-Sep 11): active, 0 class assignments
  Start date Aug 3 in Aug BH shunt list - Issue 38 fix moves it to Aug 4
- Booking accommodation 11357 (bed 178, host family, Aug 2-Sep 6, EUR 1,250): active, confirmed in DB
- Capel Street accommodation (Sep 6-Sep 14): still absent - Neil must confirm bed + fee
- Payment 17954 (EUR 2,584.96, Bank, 26 Jun 2026): xeroPaymentId = null - 37 days unreconciled
- Booking 18180: CONFIRMED, confirmed = true, amtPaid = EUR 2,584.96, amtOpen = EUR 0

Fix recipe (NOT YET RUN):

Step 1 - Run Issue 38 fix first (shunts BC 24956 to Aug 4). See issue-38-addendum-2aug-i.md.

Step 2 - Create class assignment for BC 24956 (week of Aug 4):
In SIS admin: booking 18180, BC 24956. Assign class Mon Aug 4 - Fri Aug 8. Continue weekly through Sep 11.

Step 3 - Add Capel Street booking accommodation:
Neil to confirm: which Capel bed? What fee? Dates Sep 6-Sep 14.
Available Capel beds from prior checks: 161, 168, 174, 175, 176.
INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, fee, active)
VALUES (18180, <capel_bed_id>, '2026-09-06', '2026-09-14', <fee>, true);

Step 4 - Reconcile payment 17954 in Xero:
Payment 17954 (EUR 2,584.96): xeroPaymentId = null. Accounts to reconcile.

Risk: bookings (SCA), accommodation (Capel BA), money (Xero). SCA reversible. Capel: confirm bed/fee first.
Status: OPEN. Fix NOT RUN. Student arrived. Capel BA missing. Last checked: Sun 2 Aug 2026 UTC (56th check, 11th today)