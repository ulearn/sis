Issue 41 corrected - Giampaolo Russo 144th check Thu 20 Aug afternoon
Corrections: amount was EUR 5331 in prior recipe - WRONG, that is Pietro amount. Giampaolo paid EUR 2584.96.
SQL table wrong: use booking_accommodations not BookingAccommodation.
BA 11394 Fabrizio Mauro bed89 ended 9Aug 11d stale STILL ACTIVE deactivate TODAY
BA 11357 bed178 ended 15Aug 5d stale deactivate TODAY
BA 11396 bed44 15-22Aug fee null set fee deactivate after Sat22
BA 11397 bed89 22Aug-6Sep fee null set fee TODAY before Sat22
BA 11392 bed168 6-14Sep fee EUR415 no action yet
Fee calc: 2584.96 - 1250 - 415 = 919.96 for beds 44+89 combined
Fix NOT RUN
Step1 TODAY: UPDATE booking_accommodations SET active=false WHERE id IN (11394, 11357);
Step2 TODAY confirm with Diego: UPDATE booking_accommodations SET fee=AMOUNT WHERE id IN (11396, 11397);
Step3 after Sat22: UPDATE booking_accommodations SET active=false WHERE id=11396;
Deadline Sat 22 Aug 2 days