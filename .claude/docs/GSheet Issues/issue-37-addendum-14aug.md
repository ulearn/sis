Issue 37 - Bed 83: 5 Stale Booking Accommodations - addendum 14 Aug 2026
Reporter: AC | Row: 39
29th check Fri 14 Aug 2026 UTC

ROOT CAUSE (live data):
5 stale Booking Accommodations on bed 83 (all active=true, past end date):
  BA 11239  Ivan Rodriguez Solares    ended 24 May 2026  82d stale  EUR 1050
  BA 11168  Diego Da Silva Saldanha   ended 20 Jun 2026  55d stale  EUR 700
  BA 11285  Jesus Ramirez Diaz        ended  5 Jul 2026  40d stale  fee=null (also Issue 43)
  BA 11352  Veronica Martin           ended 11 Jul 2026  34d stale  EUR 360
  BA 11179  Africa Mera Bachir        ended  9 Aug 2026   5d stale  EUR 1360
Current: BA 11173 Alessandro Signorotti (9 Aug to 30 Aug 2026)
NEXT: BA 25 Rosa Maria Mollica, booking 17844 (30 Aug to 10 Oct 2026, EUR 2100) -- ARRIVES IN 16 DAYS

FIX RECIPE (NOT YET RUN):
1. Confirm fee for BA 11285 with Diego/accounts before deactivating.
2. Deactivate 5 stale BAs:
   UPDATE booking_accommodations SET active = false WHERE id IN (11239,11168,11285,11352,11179);
   Or: prisma.bookingAccommodation.updateMany({where:{id:{in:[11239,11168,11285,11352,11179]}},data:{active:false}})
3. Fix BA 11285 fee once confirmed:
   UPDATE booking_accommodations SET fee = <CONFIRMED_FEE> WHERE id = 11285;

RISK: bookings/data-hygiene. Reversible. Blast: 5 BAs.
Urgency: Rosa Maria Mollica check-in Aug 30 -- deactivate stale BAs before then.
STATUS: Open - fix NOT RUN. Last checked: Fri 14 Aug 2026 UTC (29th check).
