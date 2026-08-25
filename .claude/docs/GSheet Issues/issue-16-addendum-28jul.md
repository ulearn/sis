Issue 16 - Melie Villard - Stale Booking Accommodation (7th check, Tue 28 Jul 2026)

Reporter: KC | Area: Booking/Accomm | Sheet row: 17

Current state (Tue 28 Jul 2026 UTC):
- Booking accommodation 11282 (bed 66, booking 17897): active = true
- Date range: 15 May 2026 to 5 Jun 2026
- Term ended 5 Jun 2026 - 53 days stale, active flag not cleared
- Last DB update: 2026-06-05T12:38:36 UTC
- No guest impact; pure data hygiene

Fix recipe (NOT YET RUN):
UPDATE BookingAccommodation SET active = false WHERE id = 11282;

Risk: Data hygiene | Low blast radius | Reversible | Cosmetic

Status: UNCHANGED - Fix NOT RUN.
Last checked: Tue 28 Jul 2026 UTC