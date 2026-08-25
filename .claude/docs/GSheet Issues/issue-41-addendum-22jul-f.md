# Issue 41 Addendum 22 Jul 2026 f
Reporter: KC | Area: Booking / Accomm | Sheet row: 43
Student: Giampaolo Russo (ID 14571, booking 18180)
Last checked: Wed 22 Jul 2026 UTC (46th hourly, 96th total)

## Status
UNCHANGED from addendum -e. Capel apartment missing, Xero unreconciled.

## Payment 17954
Amount: EUR 2584.96 | Method: Bank Transfer | Created: 29 Jun 2026
Xero payment ID: NULL — 23 days unreconciled (unchanged)
Booking ID: 18180 (correctly linked)

## Booking 18180 accommodations (expected 2: Host Family + Capel Apartment)
BA11357: Host Family, Individual room, bed 178, 2 Aug to 6 Sep 2026, 5 weeks, EUR 1250, active
Capel Street apartment: STILL MISSING — only 1 accommodation record in DB

## Booking course
BC24956: General English AM, 3 Aug to 11 Sep 2026 — zero class assignments

## Timeline
Check-in: 2 Aug 2026 = 11 calendar days away

## Fix Recipe (NOT YET RUN)

### Fix 1: Add Capel Street apartment
Confirm dates and fee with KC/Diego, then via SIS admin:
  Booking 18180 > Accommodations tab > Add accommodation
  Type: Apartment | Provider: Capel Street | Dates: (confirm) | Fee: (confirm)

Or via DB after confirming details:
  INSERT INTO booking_accommodation (booking_id, accommodation_type, room_type, start_date, end_date, fee, active, weeks, created_at, updated_at)
  VALUES (18180, 'Apartment', 'Individual', '<start>', '<end>', <fee>, true, <weeks>, NOW(), NOW());

### Fix 2: Reconcile payment 17954 in Xero
  Open Xero > find EUR 2584.96 bank transfer received ~29 Jun 2026
  Match to Giampaolo Russo invoice for booking 18180
  Xero payment ID should sync back to SIS on next reconciliation run

### Fix 3: Assign BC24956 to class
  Booking 18180 > Courses tab > BC24956 > Class Assignment
  Assign to General English AM class starting 3 Aug 2026

## Info needed
- Exact dates and fee for Capel apartment (confirm with Diego/KC)

## Risk
Category: bookings / accommodation + money | Reversible: yes
Blast radius: single student | Urgency: check-in 2 Aug (11 days)

## Previous recipe: issue-41-addendum-22jul-e.md