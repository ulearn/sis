# Issue 38 ## BC 25043 Eduardo Roche Diaz (166th check)
Reporter: ST | Area: Holidays/Bookings | Sheet row 40 | Fri 14 Aug 2026 UTC

## Root cause
- BC 25043: endDate = 2026-08-14 (TODAY), active = true, 0 SCAs
- Certificate 566 ISSUED

## Fix recipe (NOT YET RUN)
  SELECT id, name, endDate, active FROM booking_course WHERE id = 25043;
  UPDATE booking_course SET active = false WHERE id = 25043;

Risk: bookings/data-hygiene | Reversible: yes | Blast radius: zero
Status: Open - fix NOT RUN. Last checked: 2026-08-14 UTC (166th)