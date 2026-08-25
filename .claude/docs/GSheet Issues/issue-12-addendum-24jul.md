Issue 12 - Stale BAs (Massimiliano/Ernesto) - Addendum 24 Jul 2026
Sheet row: 13 | Check: 12th (Fri 24 Jul 2026 UTC)
Status: UNCHANGED - all 3 BAs still stale, active=true.
Evidence:
- BA 11162 (bed 179, bk97, Massimiliano, ended 23 May 2026): 62d stale
- BA 11314 (bed 179, bk18002, Massimiliano, ended 6 Jun 2026): 48d stale
- BA 11319 (bedId null, bk18034, Ernesto Pesoa Gil, ended 31 May 2026, EUR400): 54d stale; zero-day BA
Fix (NOT YET RUN): UPDATE BookingAccommodation SET active=false WHERE id IN (11162,11314,11319)
Note: BA 11319 - bk18034 status=PARTIAL confirmed=false - review EUR 400 fee before deactivating
Risk: Low. Reversible.
Last checked: Fri 24 Jul 2026 UTC