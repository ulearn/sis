Issue 36b -- Pietro Caccianiga (student 14521, booking 17980)
Reporter: DG | Area: Booking/Accommodation | Row 38 | 206th check Mon 17 Aug 2026 UTC

Booking 17980: CONFIRMED, EUR 5,331 fully paid
Booking Accommodation 11393: bed 88, start 2026-08-22, end 2026-09-13, active=true, fee=null
Check-in 5 days (Sat 22 Aug 2026)

FIX RECIPE (NOT YET RUN)

Step 1 -- Set fee on BA 11393 before 22 Aug (3-week period):
  SELECT id,bed_id,start_date,end_date,fee,active FROM booking_accommodations WHERE id=11393;
  UPDATE booking_accommodations SET fee=<rate> WHERE id=11393;

Risk: Accommodation | Reversible: yes | Blast radius: 1 student
Status: Fix NOT RUN. fee=null, check-in Sat 22 Aug (5 days).
Last checked: 2026-08-17 UTC (206th check)
