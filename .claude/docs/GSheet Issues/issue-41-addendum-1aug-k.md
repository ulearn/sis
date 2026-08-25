Issue 41 - Giampaolo Russo Dual Accommodation

Reporter: KC (Diego) | Area: Booking / Accomm | Sheet row: 43 | Check: 42nd (20th Sat 1 Aug 2026 UTC)

Symptom
Student booked host family (Aug 2 - Sep 6) and Capel Street apartment (Sep 6 - Sep 14, 8 nights).
Capel Street booking absent from DB. STUDENT ARRIVES TOMORROW (Sun 2 Aug 2026).

Root Cause (fresh DB - NOT YET FIXED)
Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true.
Amount paid: EUR 2,584.96 | Amount open: EUR 0 (fully paid).

Booking course 24956: General English AM, 2026-08-03 to 2026-09-11, active = true.
  Starts on Bank Holiday Aug 3 - needs Issue 38 shunt to Aug 4.

Booking accommodation 11357: bed 178, Aug 2 to Sep 6, active = true, fee EUR 1,250.
  Host family confirmed ready for tomorrow.

Capel Street accommodation Sep 6 to Sep 14: ABSENT - only 1 BA on booking 18180 (unchanged).

Payment 17954: EUR 2,584.96, Bank Transfer, payment_date 2026-06-26.
  xero_payment_id = null - now 36 days unreconciled (was 33d last check).
  hubspot_payment_id = 1268783973563.

Fix Recipe (NOT YET RUN)

Step 1 - Run Issue 38 BH shunt (tonight/Sunday) - includes BC 24956.
  See issue-38-addendum-1aug-k.md

Step 2 - Confirm Capel Street property/bed in DB:
  SELECT ap.id, ap.name, ar.id AS room_id, ab.id AS bed_id
  FROM accommodation_properties ap
  JOIN accommodation_rooms ar ON ar.property_id = ap.id
  JOIN accommodation_beds ab ON ab.room_id = ar.id
  WHERE ap.name ILIKE '%capel%';
  If no results: Capel property needs to be created. Confirm with Diego.

Step 3 - Insert Capel BA (once bed_id confirmed - NOT YET RUN):
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, bed_id, start_date, end_date, active, fee, created_at, updated_at)
  VALUES (18180, 'Apartment', <capel_bed_id>, '2026-09-06', '2026-09-14', true, <fee>, NOW(), NOW());

Step 4 - Reconcile payment 17954 in Xero (NOT YET RUN):
  UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17954;

Step 5 - Verify:
  SELECT id, bed_id, start_date, end_date, active FROM booking_accommodations WHERE booking_id = 18180;
  SELECT id, xero_payment_id FROM payments WHERE id = 17954;

Risk / Category
- Category: bookings / accommodation / finance
- Reversible: yes
- Blast radius: 1 student (Giampaolo Russo)
- Urgency: HIGH - student arrives tomorrow (Aug 2); host BA ready; Capel is Sep 6 but should be set up ASAP

Status
Open - 42nd check (20th today Sat 1 Aug 2026). NOT FIXED.
Host BA 11357 confirmed active for tomorrow.
Capel St Sep 6-14 still absent. BC 24956 still on BH. Payment 17954 now 36d without xeroId.

Last checked: 2026-08-01 UTC (42nd overall)
