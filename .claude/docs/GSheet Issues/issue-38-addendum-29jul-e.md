Issue 38 -- Aug BH 2026-08-03 (Addendum Wed 29 Jul 2026 -- 157th check)

Reporter: PG | Sheet row: 40

STATUS: Aug BH absent from school_closures. DEADLINE Fri 31 Jul 2026 (2 days).
BC count starting Aug 3: 12 (was 20 in prior reports; 8 already shunted).

EVIDENCE (live DB, Wed 29 Jul 2026):

school_closures: No row covering 2026-08-03.
2026 closures in DB: Good Friday 2026-04-03 and Christmas 2026-12-21+ only.

12 BCs starting Aug 3 (active, confirmed):
BC 88 Morning General bk82 ends 2026-08-07 (Africa Mera Bachir)
BC 1755 Morning General bk1571 ends 2026-08-14 (Maria Giulia Serpi)
BC 1766 AY Renewal Morning bk1581 ends 2026-09-04 (Maria Eduarda Alves Paiva)
BC 24908 General English AM bk18128 ends 2026-08-21 (Ai Tsunashima)
BC 24956 General English AM bk18180 ends 2026-09-11 (Giampaolo Russo - also Issue 41)
BC 24958 Academic Year Morning bk18182 ends 2027-02-05 (Aurora Madril)
BC 24959 Academic Year Morning bk18183 ends 2027-02-05 (Diego Alves da Silva Molina)
BC 24964 General English AM Plus bk18188 ends 2026-08-14 (Luana Salzano)
BC 24984 Intensive General English + IELTS bk18207 ends 2026-08-25 (Deva Onorato)
BC 25002 General English AM bk18225 ends 2026-09-18 (Aleix Cervera Gonzalez)
BC 25003 General English AM bk18225 ends 2026-09-18 (Aleix Cervera Gonzalez) - DUPLICATE of 25002 - deactivate
BC 25016 Life Pass Morning bk18238 ends 2027-01-22 (Anderson da Silva Martins)

BC 25006 (Marina Larripa, bk18228): ends 2026-08-03 - extend endDate to 2026-08-04

FIX RECIPE (NOT YET RUN):

Step 1: Insert school_closure for Aug BH
  Via SIS admin: Settings > School Closures > Add
  Name=August Bank Holiday, start=2026-08-03, end=2026-08-03, paid=true

Step 2: Shunt 11 BCs startDate Aug-3 to Aug-4
  NOT YET RUN - update BookingCourse set startDate=2026-08-04
  where id in (88,1755,1766,24908,24956,24958,24959,24964,24984,25002,25016)

Step 3: Extend BC 25006 endDate to 2026-08-04
  NOT YET RUN - update BookingCourse set endDate=2026-08-04 where id=25006

Step 4: Deactivate duplicate BC 25003
  NOT YET RUN - update BookingCourse set active=false where id=25003

RISK: bookings - reversible - blast radius 12 students, 1 deactivation

Status: OPEN - Fix NOT Run
Last checked: Wed 29 Jul 2026 UTC