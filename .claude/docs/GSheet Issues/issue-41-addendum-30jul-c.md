== Issue 41 - Giampaolo Russo - Capel Street Apartment Missing (Check-in SUNDAY 2 Aug)
Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43

-- Symptom
Student booked Host Family + Capel Street apartment. Host family confirmed.
Capel Street BA absent from SIS. CHECK-IN SUNDAY AUG 2 (2 DAYS AWAY).

-- Root Cause (Thu 30 Jul 2026 UTC - 3rd check)
- Student 14571 (Giampaolo Russo)
- Booking 18180: CONFIRMED, paid EUR 2,584.96, open EUR 0
- Accommodations on bk18180: 1 record only
  BA 11357: Host Family, bed 178 (Edel McDonald, provider 24), Aug 2-Sep 6 (5 wks),
  fee EUR 1,250, active=true, claimStatus=confirmed (Jul 01 via host-portal)
- Capel Street apartment: STILL ABSENT - no second BA record
- BC 24956: General English AM B1, Aug 3-Sep 11, active (start = Aug Bank Holiday; shunt per issue 38)

-- Fix Recipe (NOT YET RUN)

Step 1 - Find Capel Street bed:
  SELECT b.id, b.name, ap.name, r.name FROM accommodation_beds b
  JOIN accommodation_rooms r ON r.id = b.room_id
  JOIN accommodation_providers ap ON ap.id = r.provider_id
  WHERE ap.name ILIKE '%capel%' ORDER BY b.id;

Step 2 - Confirm with Diego (URGENT - 2 days):
  1. Exact start/end dates for Capel accommodation
  2. Which bed/room
  3. Room type, board
  4. Fee - invoiced, paid, or outstanding?

Step 3 - Insert BA record:
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, room_type, board, start_date, end_date, weeks, bed_id, active, fee, created_at, updated_at)
  VALUES (18180, 'Apartment', 'Individual', 'Self Catering', 'YYYY-MM-DD', 'YYYY-MM-DD', N, BED_ID, true, FEE, NOW(), NOW());

Step 4 - Shunt BC24956 if issue 38 not yet done:
  UPDATE booking_courses SET start_date='2026-08-04' WHERE id=24956;

-- Risk
Reversible (DELETE inserted BA). Blast: 1 student.
URGENT: check-in SUNDAY 2 Aug 2026 (2 days).

-- Status
OPEN - URGENT - Capel BA absent, check-in 2 days, fix NOT RUN (3rd check Thu 30 Jul 2026 UTC)