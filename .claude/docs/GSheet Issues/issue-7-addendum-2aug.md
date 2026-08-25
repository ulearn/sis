Issue 7 - Booking 17909 CANCELLED + confirmed=true (20th check)
Reporter: staff | Area: Booking | Sheet row: 8
Student: Sofiia Korkishchenko (ID 768)

Root cause (2 Aug 2026 UTC - 1st check today)
- Booking 17909: status=CANCELLED, confirmed=true (anomaly)
- amountOpen=EUR 727.50, amountPaid=EUR 0, 0 payments linked
- Last updated 2026-06-17 - 46 days stale
- Booking course 24693 (Renewal Academic Year PM, May 25-Nov 13 2026): active=true (should be false)

Fix recipe - NOT YET RUN

SQL (NOT YET RUN):
UPDATE bookings SET confirmed=false, updated_at=NOW() WHERE id=17909;
UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=24693;

Note: Verify Sofiia has an active replacement booking before deactivating.

Risk: Bookings. Reversible. 1 booking, 1 student, 1 BC. amountPaid=0 - no refund risk.
Status: OPEN - fix NOT RUN - Last checked: Sun 2 Aug 2026 UTC (20th check, 1st today, 46d stale)