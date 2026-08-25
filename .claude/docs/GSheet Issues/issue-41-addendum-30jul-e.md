## Issue 41 -- Giampaolo Russo: Capel Street BA Missing
Reporter: KC | Area: Booking / Accomm | Sheet row: 43 | CHECK-IN: Sun 2 Aug 2026 (3 days)

## Root cause (Thu 30 Jul 2026 UTC -- 6th check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96
- Booking Accommodation 11357: Host Family, bed 178, 2026-08-02 to 2026-09-06, active=true, fee EUR 1,250
- NO second BA for Capel Street -- 0 records with booking_id=18180 for Sep 6-14
- Check-in Sunday 2 Aug 2026 -- 3 days away
- Booking Course 24956 (General English AM, starts Aug 3): in Issue 38 BH fix list -- will auto-shunt to Aug 4

## Fix recipe -- NOT YET RUN

Step 1: Confirm Capel details with Diego / KC (URGENT -- check-in 3 days)
  - Bed ID for the Capel Street apartment
  - Exact dates: start 2026-09-06, end 2026-09-14? (1 week + 1 extra night)
  - Fee amount

Step 2: Find Capel bed ID (if Diego cannot provide directly)
  SELECT ab.id, ab.name, ar.name as room_name, ap.name as property_name
  FROM accommodation_beds ab
  JOIN accommodation_rooms ar ON ab.room_id = ar.id
  JOIN accommodation_properties ap ON ar.property_id = ap.id
  WHERE ap.name ILIKE '%capel%' OR ar.name ILIKE '%capel%' OR ab.name ILIKE '%capel%';

Step 3: Insert Capel BA
  INSERT INTO booking_accommodations
    (booking_id, bed_id, accommodation_type, start_date, end_date, fee, active, weeks, note)
  VALUES (
    18180, <BED_ID>, APARTMENT,
    '2026-09-06', '2026-09-14', <FEE>, true, 1,
    'Capel Street premium room -- added retroactively after system blocked duplicate accomm type'
  );

Step 4: Verify
  SELECT id, bed_id, start_date, end_date, fee, active
  FROM booking_accommodations WHERE booking_id = 18180;
  -- Should show 2 rows: BA 11357 (host family) + new Capel BA

## Note on BC 24956
BC 24956 is in Issue 38 BH fix list -- will shift 2026-08-03 to 2026-08-04 automatically.
No separate action needed for BC 24956 under Issue 41.

## Risk
Bookings / Accommodation -- reversible (DELETE the inserted row if wrong).
Blast radius: 1 student, 1 BA.
Time-critical: check-in Sun 2 Aug 2026. Diego must confirm Capel details ASAP.

## Status
Fix NOT RUN. Capel BA absent. Check-in 3 days.
Last checked: Thu 30 Jul 2026 UTC (6th check -- state unchanged)