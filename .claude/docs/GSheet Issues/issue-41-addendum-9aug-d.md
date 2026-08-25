# Issue 41 — Giampaolo Russo BA 11392 Bed Null (Addendum 9 Aug-d)

**Check:** 33rd Sun 9 Aug 2026 UTC | **Row:** 43 | 28 days to check-in (Sep 6)

## Current State (fresh query, 9 Aug 2026)

Booking Accommodation 11392 (Giampaolo Russo):
  startDate=2026-09-06, endDate=2026-09-14
  accommodationType=City Centre Apartment, roomType=Premium
  fee=EUR 415, active=true, bedId=null, bookingId=18180

Booking 18180: CONFIRMED, confirmed=true, EUR 2,584.96 paid, EUR 0 open
Booking Accommodation 11357 (Host Family, bed 178, Aug 2-Sep 6): correctly assigned
  Giampaolo transitions from host family to CCA Premium on Sep 6.

## Available Premium CCA Beds for Sep 6-14 (fresh query)

Bed 83 is busy Aug 30-Oct 11. Free beds:
  Bed 161 — available Sep 6-14
  Bed 168 — available Sep 6-14
  Bed 177 — available Sep 6-14
  Bed 194 — available Sep 6-14

(Previous H listed beds 168, 174, 175, 176, 194. Fresh query via active booking accommodations
confirms known Premium CCA beds: 161, 168, 177, 194. Beds 174/175/176 have no active records
in this type — not confirmed as different availability.)

## Fix Recipe (NOT YET RUN)

  UPDATE booking_accommodations
  SET bed_id = <BED_ID>   -- choose from: 161, 168, 177, 194
  WHERE id = 11392;

  -- Verify
  SELECT id, bed_id, start_date, end_date, accommodation_type, room_type
  FROM booking_accommodations WHERE id = 11392;

## Risk
Category: accommodation/data-hygiene. Reversible. 28 days to act.
Check-in letter will not show room allocation until bed is assigned.

Status: Open. NOT RUN. Last checked: 2026-08-09 UTC (33rd check)