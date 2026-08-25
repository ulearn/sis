Issue 41 - Giampaolo Russo Dual Accommodation

Reporter: Diego | Area: Booking / Accomm | Sheet row: 43 | Check: 37th (15th Sat 1 Aug 2026 UTC)

Symptom: Student booked host family (Aug 2-Sep 6) and Capel Street (Sep 6-Sep 14). STUDENT ARRIVED TODAY.

Root Cause (fresh DB - NOT YET FIXED):
Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed=true, paid EUR 2584.96, open EUR 0.
BA 11357 (host family bed 178): Aug 2 to Sep 6, active=true, fee EUR 1250. CHECK-IN TODAY.
Capel Street accommodation (Sep 6 to Sep 14): ABSENT - only 1 BA record on booking 18180.
BC 24956 (General English AM, Aug 3 to Sep 11): starts on Bank Holiday - needs Issue 38 shunt to Aug 4 TONIGHT.
Payment 17954: EUR 2584.96, Bank Transfer, 2026-06-29, HubSpot ID 1268783973563, xero_payment_id = null (33 days).

Fix Recipe (NOT YET RUN):
Step 1 - Run Issue 38 BH shunt tonight (BC 24956 included).
Step 2 - Confirm Capel Street bed ID and fee with Diego.
Step 3 - Find Capel bed: SELECT ab.id, ar.name, ap.name FROM accommodation_beds ab JOIN accommodation_rooms ar ON ar.id=ab.room_id JOIN accommodation_properties ap ON ap.id=ar.property_id WHERE ap.name ILIKE '%capel%';
Step 4 - Insert BA: INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active, fee, created_at) VALUES (18180, <bed_id>, '2026-09-06', '2026-09-14', true, <fee>, NOW());
Step 5 - Reconcile payment 17954 in Xero: UPDATE payments SET xero_payment_id = <xero_id> WHERE id = 17954;
Step 6 - Verify 2 BA rows on booking 18180.

Risk: bookings/accommodation, reversible, 1 student.

Status: Open - 37th check (15th today). NOT FIXED. Capel absent; BC 24956 on BH; payment xero null.
Last checked: 2026-08-01 UTC