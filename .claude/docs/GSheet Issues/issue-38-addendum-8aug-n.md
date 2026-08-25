Issue 38 -- Class Assignments (80th check, 8 Aug 2026)
Reporter: Staff | Area: Bookings/Class | Sheet row: 40

CRITICAL: All 17 BCs starting Mon 10 Aug 2026 have 0 class assignments. Confirmed fresh DB.
DEADLINE: Sunday 9 Aug 2026 evening -- classes start Monday morning.

New finding this run:
Booking 790 (Settiyanee Duangjai, BC 833 AY Morning):
  Status = ESCROW, confirmed = false
  Amount paid = EUR 4,847.50 / total = EUR 4,847.50 (FULLY PAID)
  ESCROW status despite full payment -- must release before class assignment

Booking 88 (Alessandro Signorotti, BC 96 Intensive General 30):
  Status = CONFIRMED, confirmed = false
  Amount paid = EUR 1,845 / total = EUR 2,095 -- outstanding balance EUR 250

BC list (all class assignments = 0):
  BC 96   Alessandro Signorotti      Intensive General 30  bk 88  CONFIRMED/conf=false, EUR 250 owed
  BC 108  Lucia Borroni              Intensive General 30  bk 98  CONFIRMED
  BC 109  Maicol Moretti             Morning General       bk 99  CONFIRMED
  BC 833  Settiyanee Duangjai        AY Morning            bk 790 ESCROW/fully paid -- release first
  BC 1313 Ana Luiza De Sousa        AY Afternoon          bk 1286 CONFIRMED
  BC 1818 Natanael Reis Lourenco    AY Morning            bk 1631 CONFIRMED
  BC 24915 Toshimi Hanakawa         AY Morning            bk 18140 CONFIRMED
  BC 24970 Tsengelbayar Mendsaikhan AY Afternoon          bk 18194 CONFIRMED
  BC 25004 Vincenzo Contu           GE AM Plus            bk 18226 CONFIRMED
  BC 25005 Claudia Mereu            GE AM                 bk 18227 CONFIRMED
  BC 25007 Nominjin Amartsogt       AY Morning            bk 18229 PARTIAL
  BC 25024 Josimar Roberto          GE PM                 bk 18246 CONFIRMED
  BC 25027 Jacqueline Olga Burgos   AY Morning            bk 18248 CONFIRMED
  BC 25031 Brisia Garcia Roman      AY Morning            bk 18252 CONFIRMED
  BC 25036 Jorge Perez Aldana       GE AM                 bk 18256 CONFIRMED
  BC 25039 Cristian Ravai           GE PM Plus            bk 18259 CONFIRMED
  BC 25042 Edith Nunes              GE AM                 bk 18262 PENDING

Fix recipe (NOT YET RUN):
  1. Release Settiyanee ESCROW: UPDATE bookings SET status = CONFIRMED, confirmed = true WHERE id = 790;
  2. Assign 13 CONFIRMED students: SIS admin > Class Assignment > To Be Assigned > week Aug 10.
  3. Alessandro BC 96: UPDATE bookings SET confirmed = true WHERE id = 88; then assign.
  4. After ESCROW release: assign BC 833 Settiyanee.
  5. Defer BC 25007 (PARTIAL) and BC 25042 (PENDING) -- confirm bookings first.

Risk: Bookings/class management | Reversible | Blast: 17 students start Monday without class
URGENT -- action needed Sat 8 Aug or Sun 9 Aug morning

Status: NOT RUN
Last checked: 2026-08-08 UTC (80th check)
