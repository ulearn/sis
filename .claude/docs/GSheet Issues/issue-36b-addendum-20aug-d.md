Issue 36b corrected - Pietro Caccianiga 247th check Thu 20 Aug afternoon
SQL table wrong: use booking_accommodations not BookingAccommodation.
BA 11393 bed88 22Aug-13Sep fee null starts Sat22 set fee TODAY
BA 11311 bed84 ends Sat22 fee EUR3850 deactivate after checkout
Calc fee: 5331 - 3850 = 1481 for BA 11393 confirm before running
Fix NOT RUN
Step1 TODAY: UPDATE booking_accommodations SET fee=1481 WHERE id=11393;
Step2 after Sat22: UPDATE booking_accommodations SET active=false WHERE id=11311;
Deadline Sat 22 Aug 2 days