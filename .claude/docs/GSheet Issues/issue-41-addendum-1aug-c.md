ISSUE 41 -- Giampaolo Russo: host family + Capel St accommodation
=================================================================

Area: Booking/Accommodation  Row: 43  Checked: 2026-08-01 UTC (29th hrly, 7th of day)

STUDENT ARRIVES TOMORROW (Sun Aug 2 2026)

ROOT CAUSE (7th check of day -- UNCHANGED)
- Booking 18180 (student 14571 Giampaolo Russo): CONFIRMED, confirmed=true, paid EUR 2,584.96, open EUR 0.
- Booking accommodation 11357 (bed 178, host family): Aug 2-Sep 6 2026, active=true, fee EUR 1,250 -- ready for arrival tomorrow.
- Booking course 24956 (General English AM, Aug 3-Sep 11): starts on August Bank Holiday.
  -> Will move Aug 3 to Aug 4 when Issue 38 fix runs tonight.
- Capel Street accommodation (Sep 6-Sep 14): ABSENT from DB -- Diego confirmation needed.
- Payment 17954: EUR 2,584.96, booking 18180, xeroPaymentId=null (Jun 29, 34 days unreconciled).

Capel properties: ID 2 (Capel A1) and ID 82 (Capel A2). Check available beds:
  SELECT b.id, b.name, r.name as room, p.name as property
  FROM accommodation_beds b
  JOIN accommodation_rooms r ON b.room_id = r.id
  JOIN accommodation_properties p ON r.property_id = p.id
  WHERE p.id IN (2, 82) ORDER BY p.name, r.name, b.name;

FIX RECIPE (NOT YET RUN)

Step 1 - Run Issue 38 fix TONIGHT (shunts BC 24956 from Aug 3 to Aug 4).

Step 2 - Contact Diego to confirm:
  a) Giampaolo Capel bed assignment (Sep 6-Sep 14)
  b) Fee for Capel period
  c) Check-in date/time (Aug 2) confirmed

Step 3 - Add Capel booking accommodation after Diego confirms:
  INSERT INTO booking_accommodations
    (booking_id, bed_id, start_date, end_date, active, fee, created_at, updated_at)
  VALUES (18180, <BED_ID>, 2026-09-06, 2026-09-14, true, <FEE>, NOW(), NOW());

Step 4 - Reconcile payment 17954 in Xero:
  - Payment 17954: EUR 2,584.96, Jun 29 2026, booking 18180
  - xeroPaymentId is null -- find and link the corresponding Xero payment

RISK: bookings/accommodation, reversible, 1 student.
STATUS: OPEN - CHECK-IN TOMORROW. Last checked: 2026-08-01 UTC (29th hrly, 7th of day)