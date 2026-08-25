Issue 37 + 43 - Bed 83 Stale BAs (Veronica + Jesus) - Addendum 24 Jul 2026
Sheet rows: 39 (Issue 37) and 45 (Issue 43) | Check: 6th+8th (Fri 24 Jul 2026 UTC)
Status: UNCHANGED - both BAs still active, post-checkout.
Evidence:
- BA 11285 (bed 83, bk17825, Jesus Manuel Ramirez Diaz, 21 Jun - 5 Jul 2026): 19d post-checkout, fee=null
- BA 11352 (bed 83, bk18156, Veronica Martin, 4 Jul - 11 Jul 2026): 13d post-checkout, EUR 360
Root cause: active flag not auto-cleared on checkout.
Fix (NOT YET RUN): UPDATE BookingAccommodation SET active=false WHERE id IN (11285,11352)
Risk: Low. Cosmetic. Reversible.
Last checked: Fri 24 Jul 2026 UTC