# Issue 36b addendum 21 Aug check 263
Reporter: KC | Sheet row 38 | Student: Pietro Caccianiga (14521)

Current state verified Fri 21 Aug 2026 ~12:00 UTC:
- BA 11311: bed 84, ends 2026-08-22, fee=3850, active=true (checkout tomorrow Sat 22)
- BA 11393: bed 88, starts 2026-08-22 to 2026-09-13, fee=NULL, active=true (CRITICAL: checkin ~12h)
- Booking 17980: CONFIRMED, amountTotal=5331, amountOpen=0
- Fee for BA 11393 = 5331 - 3850 = EUR 1,481 (NOT YET SET)
- No change since check 262 (11:02 UTC). Fix NOT RUN.

Fix recipe (NOT YET RUN):
  Step 1 (before Sat 22 checkin): UPDATE booking_accommodation SET fee = 1481 WHERE id = 11393;
  Step 2 (after checkout Sat 22 morning): UPDATE booking_accommodation SET active = false WHERE id = 11311;

Risk: Bookings/Money. Reversible. Blast radius: booking 17980, student 14521 only.
Status: OPEN, Fix NOT RUN. Last checked: 2026-08-21 12:00 UTC (check 263)