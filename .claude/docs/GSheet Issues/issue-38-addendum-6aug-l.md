# Issue 38 — Class Assignment Deadline (47th check, Thu 6 Aug 2026 22:01 UTC)

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

## Root cause
All 17 booking courses starting Mon 10 Aug 2026 still have 0 class assignments.
DEADLINE: Fri 7 Aug 2026 EOD (today is Thu 6 Aug — deadline tomorrow).

13 ready to assign (CONFIRMED + confirmed=true):
BC 108 (Intensive General 30, stu92 Lucia Borroni)
BC 109 (Morning General, stu93 Maicol Moretti)
BC 1313 (AY Afternoon, stu744 Ana Luiza De Sousa)
BC 1818 (AY Morning, stu1071 Natanael Reis Lourenco de Sales)
BC 24915 (AY Morning, stu877 Toshimi Hanakawa)
BC 24970 (AY Afternoon, stu948 Tsengelbayar Mendsaikhan)
BC 25004 (GE AM Plus, stu14597 Vincenzo Contu)
BC 25005 (GE AM, stu14598 Claudia Mereu)
BC 25024 (GE PM, stu14612 Josimar Roberto)
BC 25027 (AY Morning, stu14614 Jacqueline Burgos)
BC 25031 (AY Morning, stu14617 Brisia Garcia Roman)
BC 25036 (GE AM, stu14619 Jorge Perez Aldana)
BC 25039 (GE PM Plus, stu17 Cristian Ravai)

4 blocked:
BC 96: CONFIRMED + confirmed=false, stu82 (Alessandro Signorotti) — EUR 250 outstanding
BC 833: ESCROW + confirmed=false, stu400 (Settiyanee Duangjai) — escrow not released
BC 25007: PARTIAL + confirmed=false, stu759 (Nominjin Amartsogt) — EUR 370 outstanding
BC 25042: PENDING + confirmed=false, stu1015 (Edith Nunes) — EUR 456 unpaid

## Fix recipe (NOT YET RUN)

Step 1 — SIS admin > Classes > Assign students to BCs: 108, 109, 1313, 1818, 24915, 24970, 25004, 25005, 25024, 25027, 25031, 25036, 25039

Step 2 — BC 833 (ESCROW fully paid): once escrow released, set confirmed=true on its booking.
Step 3 — BC 96 (EUR 250 outstanding): collect or manually confirm, then set confirmed=true.
Step 4 — BC 25007 (EUR 370) + BC 25042 (EUR 456): collect or manually confirm.

## Risk
Category: bookings / class assignment; reversible. Blast radius: 17 students without class Mon 10 Aug.

## Status
URGENT — deadline Fri 7 Aug EOD. 0/17 BCs assigned. Fix NOT RUN.
Last checked: Thu 6 Aug 2026 22:01 UTC