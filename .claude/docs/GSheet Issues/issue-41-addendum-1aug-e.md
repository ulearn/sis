# Issue 41 — Giampaolo Russo Dual Accommodation

Reporter: Diego | Area: Booking / Accomm | Sheet row: 43 | Check: 35th (13th Sat 1 Aug 2026 UTC)

## Symptom
Student booked host family (Aug 2-Sep 6) and Capel Street apartment (Sep 6-Sep 14). Course starts on August Bank Holiday.

## Root Cause (fresh DB — NOT YET FIXED)

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true, amount paid = EUR 2,584.96, open = EUR 0.

Booking accommodation 11357 (host family, bed 178, Room 2): Aug 2 to Sep 6 2026, active = true, fee = EUR 1,250. READY — host family assigned, check-in tomorrow Sun Aug 2.

Capel Street accommodation (Sep 6 to Sep 14): NO booking accommodation record on booking 18180. Only 1 BA record exists.

Booking course 24956 (General English AM, Aug 3 to Sep 11): starts on August Bank Holiday. Must be shunted to Aug 4 via Issue 38.

Payment 17954: EUR 2,584.96, Bank Transfer, 2026-06-26, HubSpot payment ID 1268783973563. xero_payment_id = null — 36 days unreconciled.

## Fix Recipe (NOT YET RUN)

Step 1 — Run Issue 38 bank holiday shunt first (BC 24956 gets shunted Aug 3 to Aug 4). See issue-38-addendum-1aug-e.md.

Step 2 — Find the Capel Street bed ID:
  SELECT ab.id, ab.name, ar.name as room_name, ap.name as property_name
  FROM accommodation_beds ab
  JOIN accommodation_rooms ar ON ar.id = ab.room_id
  JOIN accommodation_properties ap ON ap.id = ar.property_id
  WHERE ap.name ILIKE '%capel%';
  -- Confirm bed_id and fee with Diego before inserting.

Step 3 — Insert Capel Street booking accommodation (once bed_id and fee confirmed):
  INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active, fee, created_at)
  VALUES (18180, <confirmed_bed_id>, '2026-09-06', '2026-09-14', true, <confirmed_fee>, NOW());

Step 4 — Reconcile payment 17954 in Xero:
  Find bank receipt EUR 2,584.96 dated 2026-06-26 and match to invoice for booking 18180.
  Then: UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17954;

Step 5 — Verify:
  SELECT ba.id, ba.start_date, ba.end_date, ba.active, ba.fee FROM booking_accommodations ba
  WHERE ba.booking_id = 18180;
  Expected: 2 rows (host family Aug 2-Sep 6; Capel St Sep 6-Sep 14).

## Risk
Category: bookings, accommodation. Reversible: yes. Blast radius: 1 student.
STUDENT ARRIVES TOMORROW (Sun Aug 2) — host family is ready; Capel Street and course date are not.

## Status
Open — 35th check (13th today Sat 1 Aug). NOT FIXED. Capel Street BA absent; payment xero = null.
Last checked: 2026-08-01 UTC