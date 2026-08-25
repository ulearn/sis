Issue 20 - Ariunsarnai Batbayar: No Payment / No Class Assignment

Reporter: PG | Area: Booking / Class | Sheet row: 21 | Check: 7th (6th Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED):
Booking 1605 (Ariunsarnai Batbayar, student 1047): status=PENDING, confirmed=false, paid EUR 0 of EUR 1509.
No payment records. No class assignments on booking course 1791 (AY Renewal Morning, Apr 13 to Oct 23 2026).
Last booking update: 2026-06-23 - 39 days stale. Day 110 since course start (Apr 13).

Fix Recipe (NOT YET RUN):
Step 1 - Check HubSpot deal for external payment evidence.
Step 2 (if paid): UPDATE bookings SET status='CONFIRMED', confirmed=true, amount_paid=1509, amount_open=0 WHERE id=1605;
  Then create class assignment for BC 1791 via SIS admin.
Step 3 (if not paid): UPDATE bookings SET status='CANCELLED' WHERE id=1605; UPDATE booking_courses SET active=false WHERE id=1791;

Risk: bookings, reversible, 1 student.

Status: Open - 7th check (6th today). NOT FIXED. Day 110, EUR 0/1509, 0 class assignments.
Last checked: 2026-08-01 UTC