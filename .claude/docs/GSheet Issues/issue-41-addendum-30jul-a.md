Issue 41 - Giampaolo Russo (Dual Accommodation)
Reporter: KC | Sheet row: 43
Last checked: 2026-07-30 UTC (161st check) - CHECK-IN SUNDAY AUG 2 (3 DAYS)

Root cause (NOT YET RUN):
- Student 14571 (Giampaolo Russo), Booking 18180: CONFIRMED, confirmed=true
- Booking accommodation 11357: bed 178, Aug 2 to Sep 6, host family, fee EUR 1250, active=true (correct)
- Capel Street accommodation (Sep 6 to Sep 14 2026): STILL ABSENT - only 1 BA on booking 18180
- BC 24956 (General English AM, Aug 3 to Sep 11): in Issue 38 shunt list - will move to Aug 4
- Check-in: Sunday 2 Aug 2026 - 3 days away

Fix recipe (NOT YET RUN):
Step 0 - Run Issue 38 fix first (BC 24956 needs Aug 3 to Aug 4 shunt)
Step 1 - Add Capel Street booking accommodation via SIS admin:
  Navigate to Bookings > Booking 18180 (Giampaolo Russo)
  Add Accommodation > Type: Apartment (Capel Street)
  Dates: 2026-09-06 to 2026-09-14
  Fee: verify from HubSpot deal or invoice
  Bed/room: confirm with accommodation team
  Save
  Or via DB (verify bed_id and fee from HubSpot first):
  INSERT INTO booking_accommodations (booking_id,bed_id,start_date,end_date,accommodation_type,fee,active,created_at,updated_at)
  VALUES (18180,CAPEL_BED_ID,2026-09-06,2026-09-14,Apartment,FEE,true,NOW(),NOW());
Step 2 - Check if BA 11357 appears in Matching section now
Verify:
  SELECT id,bed_id,start_date,end_date,accommodation_type,fee,active FROM booking_accommodations WHERE booking_id=18180;
  Expected: 2 rows

Risk: bookings. Reversible. Blast radius: 1 student. Check-in Sunday - handover info incomplete without Capel.
Status: NOT YET RUN - awaiting Neil approval. Last checked: 2026-07-30 UTC.