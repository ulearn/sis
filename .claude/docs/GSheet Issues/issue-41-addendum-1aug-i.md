# Issue 41 — Giampaolo Russo Dual Accommodation

Reporter: KC (Diego) | Area: Booking / Accomm | Sheet row: 43 | Check: 40th (18th Sat 1 Aug 2026 UTC)

## Symptom
Student booked host family (Aug 2 - Sep 6) and Capel Street apartment (Sep 6 - Sep 14, 8 nights).
Capel Street booking absent from DB. STUDENT ARRIVES TOMORROW (Sun 2 Aug 2026).

## Root Cause (fresh DB - NOT YET FIXED)
Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed=true.
Amount paid: EUR 2,584.96 | Amount open: EUR 0 (fully paid).

Booking course 24956: General English AM, 2026-08-03 to 2026-09-11, active=true.
  - Starts on Bank Holiday Aug 3 -> needs Issue 38 shunt to Aug 4.

Booking accommodation 11357: bed 178, Room 2, property Home, provider Patty McSweeney.
  - Start 2026-08-02, end 2026-09-06, active=true, fee EUR 1,250.
  - Host family placement confirmed.

Capel Street accommodation Sep 6 to Sep 14: ABSENT - only 1 BA on booking 18180.
  - No accommodation_properties record matching Capel Street found earlier checks.

Payment 17954: EUR 2,584.96, Bank Transfer, date 2026-06-26.
  - xeroPaymentId = null (unreconciled in Xero, 36 days).
  - hubspotPaymentId = 1268783973563.

## Fix Recipe (NOT YET RUN)

Step 1 - Run Issue 38 BH shunt (tonight/Sunday) — includes BC 24956.
  See issue-38-addendum-1aug-i.md for exact SQL.

Step 2 - Confirm Capel Street property exists in DB:
  SELECT ap.id, ap.name, ar.id as room_id, ar.name as room_name, ab.id as bed_id
  FROM accommodation_properties ap
  JOIN accommodation_rooms ar ON ar.property_id = ap.id
  JOIN accommodation_beds ab ON ab.room_id = ar.id
  WHERE ap.name ILIKE '%capel%';
  -- If no results: property needs to be created first. Confirm with Diego.

Step 3 - Insert Capel BA (once bed_id confirmed — NOT YET RUN):
  INSERT INTO booking_accommodations
    (booking_id, type, bed_id, start_date, end_date, active, fee, created_at)
  VALUES (18180, 'Apartment', <capel_bed_id>, '2026-09-06', '2026-09-14', true, <fee>, NOW());

Step 4 - Reconcile payment 17954 in Xero (NOT YET RUN):
  UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17954;
  (Or reconcile via Xero UI against INV for booking 18180.)

Step 5 - Verify:
  SELECT id, bed_id, start_date, end_date, active FROM booking_accommodations WHERE booking_id = 18180;

## Risk / Category
- Category: bookings/accommodation
- Reversible: yes
- Blast radius: 1 student (Giampaolo Russo). Student arriving tomorrow.

## Status
Open - 40th check (18th today Sat 1 Aug 2026). NOT FIXED.
CRITICAL: Student check-in TOMORROW (Sun Aug 2). Host family (Patty McSweeney) bed 178 active.
Capel St Sep 6-14 still absent. BC 24956 on BH. Payment 17954 xeroPaymentId null 36d.

Last checked: 2026-08-01 UTC