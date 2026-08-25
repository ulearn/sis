Issue 41 -- Giampaolo Russo (student 14571)
Reporter: Diego | Area: Booking / Accomm | Sheet row 43

Root cause (Mon 27 Jul 2026):
- Booking 18180: Confirmed, EUR 2584.96 fully paid
- Only BA present: BA 11357 (bed 178, host family, Aug 2-Sep 6 2026, fee EUR 1250)
- Capel BA (Sep 6-14) MISSING -- needs manual creation
- BC24956 (General English AM, Aug 3-Sep 11): active=true, 0 SCAs -- needs Aug 3 shunt (Issue 38)
- Payment 17954: EUR 2584.96, type=null, xeroPaymentId=null
- Check-in Aug 2 (Sun) = 6 days from Mon Jul 27

Fix recipe (NOT YET RUN):
Step 1: Create Capel BA via SIS admin (Booking 18180 -> Add Accommodation):
  - Type: Apartment / Capel Street premium
  - Start date: 2026-09-06, End date: 2026-09-14
  - Fee: confirm from HubSpot deal
  - Neil to identify specific Capel bed

Step 2: Fix PMT 17954 (NOT YET RUN):
  UPDATE payment SET type = Bank WHERE id = 17954;
  Then reconcile manually in Xero

Step 3: BC24956 shunt + class assign (dependent on Issue 38 fix)

Risk: Category bookings/accommodation/money | Reversible yes | single student
Urgency: HIGH -- host family check-in Aug 2 (5 days)

Status: OPEN -- 120th check Mon 27 Jul 2026 UTC. Capel BA still missing. Fix NOT RUN.
Last checked: 2026-07-27 UTC