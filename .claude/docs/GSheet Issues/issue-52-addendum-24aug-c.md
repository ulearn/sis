# Issue 52 - Fanny Scelles
Reporter: KC | Row 54 | 500th run Mon 24 Aug 2026 UTC

## Root cause
- BA 11267 (bed 23, 29 Aug to 4 Oct 2026): fee EUR 3,840, active = true
- BA 11399 (bed 54, 4 Oct to 19 Dec 2026): fee = null, active = true — NOT YET RUN
- Booking 17843: CONFIRMED, fully paid EUR 5,595.16
- Fanny Scelles ARRIVES TOMORROW (29 Aug 2026)

## Fix recipe (NOT YET RUN)

Set fee on BA 11399 before Oct 4:

  UPDATE booking_accommodation SET fee = AMOUNT WHERE id = 11399;

Confirm rate (Oct 4 to Dec 19 = 11 weeks) with KC before running.

## Risk
- Category: bookings / accommodation
- Reversible: yes
- Blast radius: single student

## Last checked
500th run Mon 24 Aug 2026 UTC
