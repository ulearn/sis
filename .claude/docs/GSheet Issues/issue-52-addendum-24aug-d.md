# Issue 52 - Fanny Scelles
Reporter: KC | Row 54 | 501st run Mon 24 Aug 2026 UTC

## Root cause
- BA 11267 (bed 23, 29 Aug to 4 Oct 2026): fee EUR 3,840, active = true
- BA 11399 (bed 54, 4 Oct to 19 Dec 2026): fee = null — NOT YET SET
- Booking 17843: CONFIRMED, fully paid EUR 5,595.16
- Fanny Scelles ARRIVES 29 Aug 2026 (5 days from Mon 24 Aug)
  Note: previous recipe and H column said ARRIVAL TOMORROW — that was wrong, corrected here

## Fix recipe (NOT YET RUN)

Set fee on BA 11399 before Oct 4:
  UPDATE booking_accommodation SET fee = AMOUNT WHERE id = 11399;
Confirm rate with KC: Oct 4 to Dec 19 = 11 weeks.

## Risk
- Category: bookings/accommodation | Reversible: yes | Blast radius: single student

## Last checked
501st run Mon 24 Aug 2026 UTC
