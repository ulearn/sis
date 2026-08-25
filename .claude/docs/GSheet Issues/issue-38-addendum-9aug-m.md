# Issue 38 -- Term Start Mon 10 Aug: 17 Booking Courses Unassigned
Check: 95th, Sun 9 Aug 2026 UTC (5th today) | Reporter: AC | Row: 40

ROOT CAUSE (fresh query Sun 9 Aug 2026 UTC -- 5th check today, NO CHANGE)
Admin action is pending -- not a data bug. All 17 BCs starting 2026-08-10 still have 0 class assignments.

READY BCs -- assign before Mon 09:00 (NOT YET RUN):
  BC  108  Lucia Borroni (Stu 92)                Intensive General 30        Aug 10-21
  BC  109  Maicol Moretti (Stu 93)               Morning General             Aug 10-21
  BC 1313  Ana Luiza De Sousa (Stu 744)          AY Afternoon                Aug 10-28
  BC 1818  Natanael Reis Lourenco (Stu 1071)     AY Morning                  Aug 10-Dec 18
  BC 24915 Toshimi Hanakawa (Stu 877)            AY Morning                  Aug 10-Jan 29
  BC 24970 Tsengelbayar Mendsaikhan (Stu 948)    AY Afternoon                Aug 10-Jan 29
  BC 25004 Vincenzo Contu (Stu 14597)            GE AM Plus (1 WEEK ONLY)    Aug 10-14
  BC 25005 Claudia Mereu (Stu 14598)             GE AM (1 WEEK ONLY)         Aug 10-14
  BC 25024 Josimar Roberto (Stu 14612)           GE PM                       Aug 10-21
  BC 25027 Jacqueline Burgos (Stu 14614)         AY Morning                  Aug 10-Feb 12
  BC 25031 Brisia Garcia Roman (Stu 14617)       AY Morning                  Aug 10-Feb 12
  BC 25036 Jorge Perez Aldana (Stu 14619)        GE AM                       Aug 10-Sep 4
  BC 25039 Cristian Ravai (Stu 17)               GE PM Plus                  Aug 10-28

ON HOLD -- do NOT assign yet (payment unresolved):
  BC   96  Alessandro Signorotti (Stu 82)   confirmed = false, EUR 250 owed
  BC  833  Settiyanee Duangjai (Stu 400)    status = ESCROW -- release first
  BC 25007 Nominjin Amartsogt (Stu 759)    status = PARTIAL, EUR 370 owed
  BC 25042 Edith Nunes (Stu 1015)          status = PENDING, EUR 456 owed

ALSO OVERDUE (started Aug 3, now 7 days late, 0 class assignments):
  BC   97  Gustavo Ferreira (Stu 83)                AY Morning     PENDING -- do not assign
  BC 1766  Maria Eduarda Alves Paiva (Stu 1028)     AY Renewal AM  CONFIRMED -- assign now
  BC 24999 Soumaya Bourguiba (Stu 14594)            GE PM          PENDING -- do not assign
  BC 25003 Aleix Cervera Gonzalez (Stu 14596)       GE AM          CONFIRMED -- assign now
  BC 25010 Alin Merticariu (Stu 14601)              GE AM          CONFIRMED -- assign now
  BC 25016 Anderson da Silva Martins (Stu 14607)    Life Pass AM   CONFIRMED -- assign now
  BC 25029 Monica Breier Fiametti (Stu 979)         AY Morning     CONFIRMED -- assign now
  BC 25035 Rakan Alghamdi (Stu 14444)               GE AY AM Plus  See Issue 12 (relink SCA 288)

FIX RECIPE -- NOT YET RUN
  1. Log into SIS Admin
  2. Assign 13 ready Aug 10 BCs to classes for week starting 2026-08-10
  3. Assign 5 CONFIRMED Aug 3 starters (1766, 25003, 25010, 25016, 25029) for current week
  4. Do NOT assign BCs 96, 833, 25007, 25042, 97, 24999 -- payment unresolved
  5. BC 25035 (Rakan): use Issue 12 recipe instead (relink SCA 288)
  DEADLINE: Before 09:00 Mon 10 Aug 2026

RISK: Category = Bookings | Reversible = Yes
Blast radius: 13 students miss Day 1; 5 Aug 3 starters now 7 days overdue

STATUS: Open -- Fix NOT RUN (admin action required via SIS Admin UI)
Last checked: Sun 9 Aug 2026 UTC (95th check, 5th today)
