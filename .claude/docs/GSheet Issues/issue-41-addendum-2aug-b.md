Issue 41 - Giampaolo Russo (student 14571) - Capel St accommodation absent
Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom
Student booked host family (Aug 2-Sep 6) and Capel Street premium room (Sep 6-Sep 14).
Host family confirmed; Capel St still absent. Student arrived today Sun 2 Aug.

Root cause - 49th check Sun 2 Aug 2026 UTC (4th today)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, paid EUR 2,584.96 in full.
- Booking accommodation 11357 (host family, bed 178, Aug 2-Sep 6, EUR 1,250): active=true - checked in today.
- Capel Street accommodation (Sep 6-Sep 14): ABSENT - only 1 booking_accommodation record on booking 18180.
- Booking course 24956 (General English AM, Aug 3-Sep 11): starts Bank Holiday - shunted to Aug 4 by Issue 38 tonight.
- Payment 17954 (EUR 2,584.96, Bank, created Jun 29): xero_payment_id=null - 34 days unreconciled.

Available Capel Street beds for Sep 6-14 (from DB query this run):
Bed 161 - A2/Room 1, Premium (property 82) - no booking in range found
Bed 168 - A1/Room 1A, Premium (property 2) - booked to Sep 5, then free until Sep 27
Bed 174 - A1/Room 1B, Premium (property 2) - booked to Sep 5, then free until Sep 27
Bed 175 - A1/Room 2B, Premium (property 2) - no booking in range found
Bed 176 - A2/Room 1B, Premium (property 82) - no booking in range found
Verify availability before booking: run SELECT * FROM booking_accommodations WHERE bed_id=<id> AND active=true AND end_date > 2026-09-05 AND start_date < 2026-09-15;

Fix recipe - NOT YET RUN

Step 1: Confirm Capel bed and fee
  Agree bed and nightly/weekly rate with Diego/accounts.
  Sep 6-Sep 14 = 8 nights (1 week + 1 extra night as per original request).

Step 2: Insert Capel Street booking accommodation
  INSERT INTO booking_accommodations (booking_id,bed_id,start_date,end_date,active,fee)
  VALUES (18180,<bed_id>,'2026-09-06','2026-09-14',true,<agreed_fee>);

Step 3: Verify accommodations on booking 18180
  SELECT id,bed_id,start_date,end_date,active,fee FROM booking_accommodations WHERE booking_id=18180;
  -- Should return 2 rows: BA 11357 (host family) + new Capel St record

Step 4: Reconcile payment 17954 in Xero
  Once Xero payment ID is found: UPDATE payments SET xero_payment_id=<id> WHERE id=17954;

Step 5: BC 24956 handled by Issue 38 (start date shunted to Aug 4 tonight).

Risk: bookings + money (Xero reconciliation) | Reversible: Yes | Blast radius: 1 student

Status: Open - NOT YET RUN (student arrived today; Capel BA still absent; Xero 34 days)
Last checked: Sun 2 Aug 2026 UTC (49th check, 4th today)