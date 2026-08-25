Issue 38 -- Class Assignment Scheduling (Addendum, 8 Aug 2026 -- d)
Reporter: PG/AC | Area: Holidays, Bookings | Sheet row: 40 | 70th check Sat 8 Aug 2026 UTC

Root Cause (live data, 8 Aug 2026 UTC -- NOT YET RUN)

CRITICAL -- BC 25004 + 25005 still unassigned (flagged critical in 69th check, still not done):
- BC 25004 (Vincenzo Contu, General English AM Plus, 10-14 Aug): 0 SCAs -- starts Monday
- BC 25005 (Claudia Mereu, General English AM, 10-14 Aug): 0 SCAs -- starts Monday

Overdue -- 6 Aug-3 Booking Courses (5 school days, 0 SCAs each):
- BC 1766 Maria Eduarda Alves Paiva, AY Renewal Morning, Aug 3-Sep 4, EUR 0 open, confirmed
- BC 25003 Aleix Cervera Gonzalez, General English AM, Aug 3-Sep 18, EUR 0 open, confirmed
- BC 25010 Alin Merticariu, General English AM, Aug 3-28, EUR 0 open, confirmed
- BC 25016 Anderson da Silva Martins, Life Pass Morning, Aug 3 2026-Jan 22 2027, EUR 0 open, confirmed
- BC 25029 Monica Breier Fiametti, AY Morning, Aug 3-Nov 13, EUR 0 open, confirmed
- BC 25035 Rakan Alghamdi, General English Academic Year AM Plus, Aug 3-Dec 18, EUR 0 open, confirmed

Mon Aug 10 -- 10 more confirmed BCs ready to assign (EUR 0 open, 0 SCAs):
- BC 108 Lucia Borroni, Intensive General 30
- BC 109 Maicol Moretti, Morning General
- BC 1818 Natanael Reis Lourenco de Sales, AY Morning
- BC 24915 Toshimi Hanakawa, AY Morning
- BC 24970 Tsengelbayar Mendsaikhan, AY Afternoon
- BC 25024 Josimar Roberto, General English PM
- BC 25027 Jacqueline Olga Burgos, AY Morning
- BC 25031 Brisia Garcia Roman, AY Morning
- BC 25036 Jorge Perez Aldana, General English AM
- BC 25039 Cristian Ravai, General English PM Plus

Mon Aug 10 -- Borderline:
- BC 1313 Ana Luiza De Sousa, AY Afternoon, EUR 120 open -- confirmed = true

Mon Aug 10 -- 4 Blocked (confirmed = false or ESCROW):
- BC 96 Alessandro Signorotti, Intensive General 30, EUR 250 open
- BC 833 Settiyanee Duangjai, AY Morning, ESCROW
- BC 25007 Nominjin Amartsogt, AY Morning, EUR 370 open, PARTIAL
- BC 25042 Edith Nunes, General English AM, EUR 456 open, PENDING

Fix Recipe (NOT YET RUN)

Step 1 URGENT NOW -- Assign BC 25004 + BC 25005:
  SIS Admin > each student > Bookings > Booking Course > Assign Class.
  1-week courses end Fri 14 Aug. Students arrive Monday unassigned if not done today (Sat).

Step 2 URGENT -- Assign 6 Aug-3 BCs (5 school days overdue):
  SIS Admin > each student > Assign Class.
  Maria Eduarda (BC 1766), Aleix (BC 25003), Alin (BC 25010),
  Anderson (BC 25016), Monica (BC 25029), Rakan (BC 25035).

Step 3 -- Assign 10 confirmed Aug-10 BCs before Monday:
  BCs: 108, 109, 1818, 24915, 24970, 25024, 25027, 25031, 25036, 25039.

Step 4 -- BC 1313 (Ana Luiza, EUR 120 open, confirmed=true):
  Decide: collect EUR 120 balance or assign given confirmed=true.

Step 5 -- Resolve 4 blocked Aug-10 BCs:
  BC 96/25007/25042: chase balances. BC 833: wait for escrow release.

Risk: bookings/scheduling; reversible
Status: OPEN -- Fix NOT RUN
Last checked: 2026-08-08 UTC (70th check)
