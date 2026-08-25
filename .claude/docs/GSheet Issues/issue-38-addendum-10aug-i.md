Issue 38 — Class Assignment Backlog (Addendum 10 Aug 2026, run i)

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row: 40

MOST URGENT — Eduardo Roche Diaz (BC 25043):
- Booking Course 25043: General English PM, 2026-08-10 (TODAY) to 2026-08-14 (FRIDAY)
- active = true, SCAs = 0 — Day 1 of course, ends in 4 days
- PM classes: Class 6 (B2&C1 PM, Robbie Tomlinson), Class 9 (A2 PM, Mark Townsend),
  Class 11 (B1 PM, Eoghan Lyng), Class 14 (C1 PM)

Fidelo ghost BCs — expire Fri 14 Aug (4 days):
- BC 1144 (ANAR-ERDENE BATBAYAR): ends 2026-08-14, SCAs=0 throughout lifetime
- BC 1305 (Nomin Nergui): ends 2026-08-14, SCAs=0 throughout lifetime
- BC 1344 (Bat-Orgil Baljinnyam): ends 2026-08-14, SCAs=0 throughout lifetime
- BC 1591 (Turbold Altankhuyag): ends 2026-08-14, SCAs=0 throughout lifetime
- Migration artifacts for Mongolian students — will expire Friday automatically.

Aug-10 starters with 0 SCAs (day 1):
- BC 1313 (Ana Luiza De Sousa): ends 2026-08-28
- BC 24970 (Tsengelbayar Mendsaikhan): ends 2027-01-29
- BC 25024 (Josimar Roberto): ends 2026-08-21
- BC 25036 (Jorge Perez Aldana): ends 2026-09-04
- BC 25039 (Cristian Ravai): ends 2026-08-28

Aug-3 stragglers (day 8 still unassigned):
- BC 1766 (Maria Eduarda Alves Paiva), BC 25003 (Aleix Cervera Gonzalez)
- BC 25010 (Alin Merticariu), BC 25016 (Anderson da Silva Martins)
- BC 25029 (Monica Breier Fiametti), BC 25035 (Rakan Alghamdi)

FIX RECIPE — NOT YET RUN

Step 1 — URGENT: Assign Eduardo BC 25043 TODAY
SIS admin -> Eduardo Roche Diaz -> BC 25043 (PM, Aug 10-14)
Assess level -> assign to appropriate PM class (6/9/11/14)
Create SCA: weekStart=2026-08-10, weekEnd=2026-08-14

Step 2 — Assign Aug-10 starters
BCs 1313, 24970, 25024, 25036, 25039 -> assign in SIS admin

Step 3 — Assign Aug-3 stragglers (8 days late)
BCs 1766, 25003, 25010, 25016, 25029, 25035 -> assign in SIS admin

Step 4 — Fidelo ghosts (optional)
BCs 1144/1305/1344/1591 expire Friday. Recommended: let expire.
To deactivate now (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE id IN (1144, 1305, 1344, 1591);

Risk: attendance + bookings. Eduardo CRITICAL (ends Friday, all attendance lost).
Status: Open — 12 BCs with 0 SCAs.
Last checked: Mon 10 Aug 2026 UTC (111th check)