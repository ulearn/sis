Issue 41 - Giampaolo Russo (student 14571) - Capel St accommodation absent
Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom
Student booked host family (Aug 2-Sep 6) and Capel Street premium room (Sep 6-Sep 14).
Capel St still absent from SIS. Student arrived today Sun 2 Aug.

Root cause - 48th check Sun 2 Aug 2026 UTC
- Booking 18180 (Giampaolo Russo, student 14571): Confirmed, paid EUR 2,584.96 in full.
- BA 11357 (host family, bed 178, Aug 2-Sep 6, EUR 1,250): active=true - CONFIRMED. Student arrived today.
- Capel Street accommodation (Sep 6-Sep 14): ABSENT - only 1 booking_accommodation on booking 18180.
- BC 24956 (General English AM, Aug 3-Sep 11): starts Bank Holiday Aug 3 - shunted to Aug 4 by Issue 38 tonight.
- Payment 17954 (EUR 2,584.96, Bank): xero_payment_id = null, created 2026-06-29 - 34 days unreconciled.

Fix recipe - NOT YET RUN

Step 1: Find Capel Street bed ID
  SELECT b.id, b.room_name, r.name as room, p.name as property
  FROM accommodation_beds b
  JOIN accommodation_rooms r ON r.id = b.room_id
  JOIN accommodation_properties p ON p.id = r.property_id
  WHERE p.name ILIKE LIKE capel;

Step 2: Insert Capel Street booking accommodation
  Once bed_id confirmed and fee agreed with Diego/accounts:
  INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active, fee)
  VALUES (18180, capel_bed_id, 2026-09-06, 2026-09-14, true, agreed_fee);
  Sep 6 to Sep 14 = 8 nights (1 week + 1 extra night as agreed)

Step 3: Reconcile payment 17954 in Xero
  UPDATE payments SET xero_payment_id = xero_id WHERE id = 17954;

Step 4: BC 24956 handled by Issue 38 fix (no separate action needed)

Step 5: Verify
  SELECT id, bed_id, start_date, end_date, active, fee FROM booking_accommodations WHERE booking_id = 18180;
  -- Should return 2 rows: BA 11357 (host) + new Capel St BA
  SELECT xero_payment_id FROM payments WHERE id = 17954;
  -- Should be non-null

Risk / category
Category: bookings + money (Xero reconciliation) | Reversible: Yes
Blast radius: 1 student, 1 payment

Status: Open - NOT YET RUN (student arrived today; Capel BA still absent)
Last checked: Sun 2 Aug 2026 UTC (47th check)
