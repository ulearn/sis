## Issue 41 — Giampaolo Russo: Capel Street BA Missing
Reporter: KC | Area: Booking / Accomm | Sheet row: 43 | CHECK-IN: Sun 2 Aug 2026 (2 days)

## Root cause (Thu 30 Jul 2026 UTC — 4th check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96
- BA11357: Host Family, bed 178, 2026-08-02 to 2026-09-06, active=true, fee EUR 1,250
- NO second BA for Capel Street (0 BA rows with booking_id=18180 for Sep 6-14)
- Check-in Sunday 2 Aug 2026 — 2 days away

## Fix recipe — NOT YET RUN

### Step 1: Confirm Capel details with Diego / KC
- Bed ID for Capel Street apartment
- Start: 2026-09-06, End: 2026-09-14 (verify)
- Fee amount

### Step 2: Find Capel bed ID
SELECT ab.id, ab.name, ar.name FROM accommodation_beds ab
JOIN accommodation_rooms ar ON ab.room_id = ar.id
WHERE ar.name ILIKE '%capel%' OR ab.name ILIKE '%capel%';

### Step 3: Insert Capel BA
INSERT INTO booking_accommodations
  (booking_id, bed_id, accommodation_type, start_date, end_date, fee, active, weeks, note)
VALUES (18180, <BED_ID>, 2026-09-06, 2026-09-14, <FEE>, true, 1,
        'Capel Street premium — added retroactively 2026-07-31');

## Risk
Bookings/Accomm — reversible; blast radius 1 student, 1 BA
Time-critical: check-in Sun 2 Aug 2026

## Status
Fix NOT RUN. Capel BA absent. Check-in 2 days — Diego must confirm urgently.
Last checked: Thu 30 Jul 2026 UTC