Issue 43 - Bed 83: Same 5 Stale Booking Accommodations - addendum 14 Aug 2026
Reporter: KC | Row: 45
29th check Fri 14 Aug 2026 UTC

ROOT CAUSE (live data):
Same 5 stale Booking Accommodations on bed 83 as Issue 37:
  BA 11239  ended 24 May 2026  82d stale
  BA 11168  ended 20 Jun 2026  55d stale
  BA 11285  ended  5 Jul 2026  40d stale (fee null)
  BA 11352  ended 11 Jul 2026  34d stale
  BA 11179  ended  9 Aug 2026   5d stale
Booking 17825 (Jesus Manuel Ramirez Diaz): CONFIRMED, confirmed=true, fully paid EUR 2,008
Current: BA 11173 Alessandro Signorotti (Aug 9 to Aug 30)
NEXT: BA 25 Rosa Maria Mollica, booking 17844 (30 Aug to 10 Oct 2026, EUR 2100) -- ARRIVES IN 16 DAYS

FIX RECIPE (NOT YET RUN):
1. Confirm fee for BA 11285 with Diego (fee=null -- same as Issue 37 fix step 1).
2. Deactivate 5 stale BAs:
   UPDATE booking_accommodations SET active = false WHERE id IN (11239,11168,11285,11352,11179);
3. Fix BA 11285 fee once confirmed:
   UPDATE booking_accommodations SET fee = <CONFIRMED_FEE> WHERE id = 11285;

RISK: bookings/data-hygiene. Reversible.
Urgency: Rosa Maria Mollica check-in Aug 30 (16 days) -- fix before then.
STATUS: Open - fix NOT RUN. Last checked: Fri 14 Aug 2026 UTC (29th check).
