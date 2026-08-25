# Issue 41 Addendum 22 Aug 2026 (d) - Giampaolo Russo

Reporter: AC | Area: Booking / Accomm | Sheet row: 43

Symptom: Student booked host family then apartment; accommodation data inconsistent.

Root cause (451st check, Sat 22 Aug 2026 UTC - 6th check today, unchanged since 444th):

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96, Xero unreconciled (xeroPaymentId = null on payment 17954).

Booking Accommodations for booking 18180 - 4 BAs total:
- BA 11357 (bed 178, host family): Aug 2-15, fee EUR 1,250, active = true - 7 days stale, checkout date passed.
- BA 11396 (bed 44, host family): Aug 15-22, fee = null, active = true - checkout date NOW PAST (end date = today), fee still NOT SET. Fix overdue.
- BA 11397 (bed 89, apartment): Aug 22-Sep 6, fee = null, active = true - checkin occurred today, fee still NOT SET.
- BA 11392 (bed 168, Capel Street apt): Sep 6-14, fee = EUR 415, active = true - future, fee already set.

Fee calculation (confirm proportional split with Diego before running):
  Total EUR 2,584.96 minus EUR 1,250 (BA 11357) minus EUR 415 (BA 11392) = EUR 919.96 for BAs 11396+11397.
  Proportional split (1 week + 2 weeks): BA 11396 = EUR 306.65; BA 11397 = EUR 613.31.

Fix recipe (NOT YET RUN):
Step 1 - Set fee on BA 11396: UPDATE booking_accommodations SET fee = 306.65, updated_at = NOW() WHERE id = 11396;
Step 2 - Deactivate BA 11396: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11396;
Step 3 - Set fee on BA 11397: UPDATE booking_accommodations SET fee = 613.31, updated_at = NOW() WHERE id = 11397;
Step 4 - Deactivate BA 11357: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11357;

Verify: SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodations WHERE booking_id = 18180;
Expect: 11357 active=false; 11396 fee=306.65 active=false; 11397 fee=613.31 active=true; 11392 fee=415 active=true.

Risk: bookings/accomm | Reversible: yes | Blast radius: 1 booking, 4 BAs.
Status: CRITICAL - Aug 22 checkout PAST, checkin occurred. Fix NOT RUN (6th check today).
Last checked: 2026-08-22 Sat UTC (451st check)
