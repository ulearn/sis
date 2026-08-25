# Issue 52 - Fanny Scelles (student 14451)
Reporter: KC | Area: Booking / Accomm | Sheet row 54 | 490th check Mon 24 Aug 2026 UTC

## Root Cause (verified from live DB, 24 Aug 2026)
Booking 17843: CONFIRMED, confirmed = true, fully paid EUR 5,595.16.
BA 11267 (bed 23, 29 Aug - 4 Oct 2026, EUR 3840): first stay, starts in 5 days, fee OK
BA 11399 (bed 54, 4 Oct - 19 Dec 2026, fee null): second stay, fee missing

## Fix Recipe (NOT YET RUN)
Set fee on BA 11399 (bed 54, Oct 4 - Dec 19, ~10.5 weeks).
Rate estimate: EUR 3,840 / 5wks = EUR 768/wk -> 10.5wks ~ EUR 8,064. Verify with host/Kelly.
  UPDATE booking_accommodations SET fee = 8064.00, updated_at = NOW() WHERE id = 11399;

No stale BAs to deactivate.

## Risk
Category: Accommodations / money. Reversible. Single student.
Urgency: Medium - student arrives 29 Aug; second stay fee needed before 4 Oct.

## Status
Fix NOT RUN. Last checked: 2026-08-24 UTC. Arrival in 5 days.