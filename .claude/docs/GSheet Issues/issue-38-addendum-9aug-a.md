Issue 38 (81st check Sun 9 Aug 2026) -- Sheet row 40

CRITICAL: All 17 BCs starting Mon 10 Aug still have 0 class assignments.
DEADLINE: Today (Sun 9 Aug) -- classes start tomorrow.

Verified fresh DB. No change from 80th check.

BC list (all sca_count = 0):
  BC 96   Alessandro Signorotti      Intensive 30     bk 88   CONFIRMED/conf=false EUR 250 open
  BC 108  Lucia Borroni              Intensive 30     bk 98   CONFIRMED fully paid
  BC 109  Maicol Moretti             Morning General  bk 99   CONFIRMED fully paid
  BC 833  Settiyanee Duangjai        AY Morning       bk 790  ESCROW/fully paid EUR 4847.50
  BC 1313 Ana Luiza De Sousa        AY Afternoon     bk 1286 CONFIRMED EUR 120 open
  BC 1818 Natanael Reis              AY Morning       bk 1631 CONFIRMED fully paid
  BC 24915 Toshimi Hanakawa         AY Morning       bk 18140 CONFIRMED fully paid
  BC 24970 Tsengelbayar Mendsaikhan AY Afternoon     bk 18194 CONFIRMED fully paid
  BC 25004 Vincenzo Contu           GE AM Plus       bk 18226 CONFIRMED fully paid
  BC 25005 Claudia Mereu            GE AM            bk 18227 CONFIRMED fully paid
  BC 25007 Nominjin Amartsogt       AY Morning       bk 18229 PARTIAL EUR 370 open
  BC 25024 Josimar Roberto          GE PM            bk 18246 CONFIRMED fully paid
  BC 25027 Jacqueline Olga Burgos   AY Morning       bk 18248 CONFIRMED fully paid
  BC 25031 Brisia Garcia Roman      AY Morning       bk 18252 CONFIRMED fully paid
  BC 25036 Jorge Perez Aldana       GE AM            bk 18256 CONFIRMED fully paid
  BC 25039 Cristian Ravai           GE PM Plus       bk 18259 CONFIRMED fully paid
  BC 25042 Edith Nunes              GE AM            bk 18262 PENDING EUR 456 unpaid

Fix recipe (NOT YET RUN):
  1. Release Escrow bk 790: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=790; then assign BC 833.
  2. Fix confirmed=false bk 88: UPDATE bookings SET confirmed=true WHERE id=88; then assign BC 96.
  3. Assign 13 ready BCs in SIS admin (108,109,1313,1818,24915,24970,25004,25005,25024,25027,25031,25036,25039).
  4. After Steps 1+2: assign BCs 833 and 96.
  5. Defer BC 25007 (PARTIAL EUR 370) and BC 25042 (PENDING EUR 456).

Risk: Bookings/class. Reversible. Blast: 17 students no class Monday.
Status: NOT RUN | Last checked: 2026-08-09 UTC (81st check)
