Issue 38 -- Classes Start Tomorrow: 82nd Check (9 Aug 2026 UTC)
Sheet row: 40 -- CRITICAL

STATUS: UNCHANGED -- classes start Mon 10 Aug, all 17 BCs still at 0 class assignments.
Verified fresh DB. Identical to 81st check. Use recipe: issue-38-addendum-9aug-a.md.

READY (13) -- CONFIRMED confirmed=true -- assign immediately:
  BC 108   Lucia Borroni              Intensive General 30  bk 98    EUR 912.00
  BC 109   Maicol Moretti             Morning General        bk 99    EUR 764.60
  BC 1313  Ana Luiza De Sousa         AY Afternoon           bk 1286  EUR 1360.00
  BC 1818  Natanael Reis Lourenco     AY Morning             bk 1631  EUR 2510.50
  BC 24915 Toshimi Hanakawa           AY Morning             bk 18140 EUR 1817.50
  BC 24970 Tsengelbayar Mendsaikhan   AY Afternoon           bk 18194 EUR 1700.00
  BC 25004 Vincenzo Contu             GE AM Plus             bk 18226 EUR 215.13
  BC 25005 Claudia Mereu              GE AM                  bk 18227 EUR 178.77
  BC 25024 Josimar Roberto            GE PM                  bk 18246 EUR 290.00
  BC 25027 Jacqueline Olga Burgos     AY Morning             bk 18248 EUR 2782.50
  BC 25031 Brisia Garcia Roman        AY Morning             bk 18252 EUR 2162.75
  BC 25036 Jorge Perez Aldana         GE AM                  bk 18256 EUR 658.00
  BC 25039 Cristian Ravai             GE PM Plus             bk 18259 EUR 1544.30

NEED confirmed=true first (1):
  BC 96  Alessandro Signorotti  Intensive 30  bk 88  EUR 3940 paid
  Fix: UPDATE bookings SET confirmed = true WHERE id = 88;

ESCROW -- release before assigning (1):
  BC 833 Settiyanee Duangjai  AY Morning  bk 790  EUR 4847.50 paid
  Fix: UPDATE bookings SET status = CONFIRMED, confirmed = true WHERE id = 790;

NOT READY -- defer (2):
  BC 25007  Nominjin Amartsogt  AY Morning  bk 18229  PARTIAL EUR 0 paid
  BC 25042  Edith Nunes         GE AM        bk 18262  PENDING EUR 0 paid

FIX RECIPE (NOT YET RUN):
  1. UPDATE bookings SET confirmed = true WHERE id = 88;
  2. UPDATE bookings SET status = CONFIRMED, confirmed = true WHERE id = 790;
  3. Assign 13 ready BCs in SIS admin: 108, 109, 1313, 1818, 24915, 24970, 25004, 25005, 25024, 25027, 25031, 25036, 25039
  4. Assign BCs 96 and 833 after steps 1-2.
  5. Defer BC 25007 and BC 25042 until payment received.

RISK: bookings/class | Reversible: yes | Blast: 17 students arrive Monday with no class placement

STATUS: NOT RUN
Last checked: 2026-08-09 UTC (82nd check)