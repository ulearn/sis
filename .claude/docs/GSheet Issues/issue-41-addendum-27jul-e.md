Issue 41 - Giampaolo Russo - Capel BA Absent, Check-in 2 Aug - Addendum 27 Jul 2026 (e)

Reporter: Diego | Area: Booking/Accomm | Sheet row: 43 | Last checked: 2026-07-27 UTC

Root Cause (fresh DB 2026-07-27)

Student 14571 (Giampaolo Russo), booking 18180: CONFIRMED, EUR 2584.96 fully paid. BA 11357 (Host Family, bed 178, 2 Aug-6 Sep 2026): active=true, fee EUR 1250 - PRESENT. Capel Street / apartment accommodation: ABSENT from booking_accommodations (only 1 BA confirmed). BC 24956 (General English AM, 3 Aug-11 Sep 2026): active=true, 0 SCAs. Note: BC starts on Aug Bank Holiday (Issue 38). Check-in: Sun 2 Aug 2026 (6 days).

Fix Recipe (NOT YET RUN)

Step 1 - Verify via HubSpot deal: check line items for Capel/apartment accommodation. Compare total vs EUR 1250.

Step 2 - If Capel owed:
  INSERT INTO booking_accommodations (created_at, updated_at, booking_id, accommodation_type, room_type, start_date, end_date, weeks, active, fee)
  VALUES (NOW(), NOW(), 18180, 'Apartment', 'Individual', '<start>', '<end>', <weeks>, true, <fee>);
  Then allocate bed via SIS Admin -> Accommodation.

Step 3 - Assign class for BC 24956 (after Issue 38 fixed):
  SIS Admin -> Classes -> General English AM, week starting Aug 4
  Verify: SELECT * FROM student_class_assignments WHERE booking_course_id=24956;

Risk: bookings/accommodation. Reversible: yes. Check-in imminent.

Status: URGENT - check-in 6 days, Capel absent. Fix NOT RUN. Last checked: 2026-07-27 UTC
