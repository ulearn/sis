Issue 38 - Class assignments: courses starting Mon 10 Aug 2026 - 84th check Sun 9 Aug 2026 UTC
Sheet row: 40

STATUS: CRITICAL - Classes start TOMORROW Mon 10 Aug. All 17 BCs still at 0 class assignments.
Unchanged from 83rd check. Fix NOT RUN.

13 READY (CONFIRMED, confirmed=true - assign now):
  BC 108  Lucia Borroni              Intensive General 30  bk98    EUR 912
  BC 109  Maicol Moretti             Morning General       bk99    EUR 764.60
  BC 1313 Ana Luiza De Sousa         AY Afternoon          bk1286  EUR 1360
  BC 1818 Natanael Reis Lourenco     AY Morning            bk1631  EUR 2510.50
  BC 24915 Toshimi Hanakawa          AY Morning            bk18140 EUR 1817.50
  BC 24970 Tsengelbayar Mendsaikhan  AY Afternoon          bk18194 EUR 1700
  BC 25004 Vincenzo Contu            GE AM Plus            bk18226 EUR 215.13
  BC 25005 Claudia Mereu             GE AM                 bk18227 EUR 178.77
  BC 25024 Josimar Roberto           GE PM                 bk18246 EUR 290
  BC 25027 Jacqueline Olga Burgos    AY Morning            bk18248 EUR 2782.50
  BC 25031 Brisia Garcia Roman       AY Morning            bk18252 EUR 2162.75
  BC 25036 Jorge Perez Aldana        GE AM                 bk18256 EUR 658
  BC 25039 Cristian Ravai            GE PM Plus            bk18259 EUR 1544.30

1 NEEDS confirmed=true first (then assign):
  BC 96 (Alessandro Signorotti, bk88): CONFIRMED confirmed=false, EUR 1,845 paid / EUR 2,095 total (partial).
  Fix: UPDATE bookings SET confirmed = true WHERE id = 88;

1 IN ESCROW (fully paid - release then assign):
  BC 833 (Settiyanee Duangjai, bk790): ESCROW confirmed=false, EUR 4,847.50 fully paid.
  Fix: SIS admin release ESCROW booking 790, set confirmed=true.

2 NOT READY (defer until payment received):
  BC 25007 Nominjin Amartsogt  AY Morning  bk18229  PARTIAL EUR 980
  BC 25042 Edith Nunes         GE AM       bk18262  PENDING EUR 0

FIX RECIPE (NOT YET RUN):
  1. UPDATE bookings SET confirmed = true WHERE id = 88;
  2. SIS admin: Booking 790 - release ESCROW, set confirmed=true (accounts sign-off first).
  3. SIS admin class assignment: assign BCs 108, 109, 1313, 1818, 24915, 24970, 25004, 25005, 25024, 25027, 25031, 25036, 25039.
  4. After steps 1-2 complete: assign BC 96 and BC 833.
  5. Defer BC 25007 and BC 25042 until payment received.

RISK: bookings/class | Reversible: yes | Step 2 needs accounts sign-off.
STATUS: NOT RUN
Last checked: 2026-08-09 UTC (84th check)
