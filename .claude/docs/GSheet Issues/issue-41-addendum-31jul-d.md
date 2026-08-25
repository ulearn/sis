# Issue 41 Addendum — Fri 31 Jul 2026 (14th check) — HOST FAMILY CHECK-IN TOMORROW

Reporter: Diego | Area: Booking / Accommodation | Sheet row 43
Student: Giampaolo Russo, student 14571, booking 18180

## STATUS: HOST FAMILY CHECK-IN IS TOMORROW (Sunday Aug 2, 2026)

## Evidence (live DB, Fri 31 Jul 2026)

### Booking 18180
- Status: CONFIRMED, confirmed = true
- Amount paid: EUR 2,584.96 = total EUR 2,584.96 (fully paid)
- Student: 14571 (Giampaolo Russo)

### Existing accommodation: Host Family (correct)
- Booking accommodation 11357
- Bed 178, Room 157, Property 66 (Home, 5 Claremont Close, Glasnevin)
- Type: Host Family, Individual, Half Board
- Start: Aug 2, 2026 — End: Sep 6, 2026 (5 weeks)
- Fee: EUR 1,250
- Active: true
- Claim status: confirmed (provider confirmed via host portal on Jul 1)

### Missing: Capel Street apartment
- Student was booked for a second accommodation at a Capel Street property Sep 6-14 (8 nights)
- NO booking_accommodation record exists for this period
- Bed/room not assigned, fee not confirmed
- Diego has not yet provided the bed/fee details

### Course
- BC 24956: General English AM, Aug 3-Sep 11, active, booking 18180
- Note: starts Aug 3 (Bank Holiday) — included in Issue 38 shunt list (needs start moved to Aug 4)

## Fix Recipe (NOT YET RUN)

### Prerequisite: Get Capel Street details from Diego
- Which bed/room at Capel Street?
- What is the fee for 8 nights (Sep 6-14)?
- Is there an existing property record in SIS for the Capel Street address?

### Step 1 (once Diego confirms): Insert Capel Street booking_accommodation
```sql
-- NOT YET RUN — fill in bedId and fee once confirmed
INSERT INTO booking_accommodation
  (booking_id, accommodation_type, room_type, board, start_date, end_date, weeks, bed_id, fee, active)
VALUES
  (18180, 'Apartment', [room_type], 'Self Catering', '2026-09-06', '2026-09-14', 1, [bed_id], [fee], true);
```

### Step 2: Shunt BC 24956 start from Aug 3 to Aug 4 (covered by Issue 38 recipe)
```sql
-- NOT YET RUN — part of Issue 38 bulk shunt
UPDATE booking_course SET start_date = '2026-08-04' WHERE id = 24956;
```

## Risk
- Category: bookings / accommodation
- Reversible: yes
- Blast radius: 1 booking

## Status
Fix NOT RUN as of 14th check Fri 31 Jul 2026.
Host family check-in TOMORROW (Sun Aug 2). No action needed for host family.
Capel Street BA still missing — waiting on Diego.

## Last checked
Fri 31 Jul 2026 ~14th hourly run UTC
