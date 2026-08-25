Issue 38 -- Aug Bank Holiday (addendum Sat 25 Jul 2026 UTC)

Sheet row: 40 | Area: Holidays / Bookings

Current state (Sat 25 Jul 2026 UTC):
Aug 3 Bank Holiday = 9 calendar days away
18 BCs start Aug 3 (BH) or Aug 4

BCs starting Aug 3 (17 total):
  BC 88    Africa Mera Bachir         Morning General (needs shunt to Aug 4)
  BC 97    Gustavo Ferreira           Academic Year Morning (auto-shunted)
  BC 1755  Maria Giulia Serpi         Morning General (needs shunt)
  BC 1766  Maria Eduarda Alves Paiva  AY Renewal Morning (auto-shunted)
  BC 24627 Angelica Guerin            Morning General (needs shunt)
  BC 24908 Ai Tsunashima              General English AM (needs shunt)
  BC 24956 Giampaolo Russo            General English AM (needs shunt)
  BC 24958 Aurora Madril Oliveira     Academic Year Morning (auto-shunted)
  BC 24959 Diego Alves da Silva       Academic Year Morning (auto-shunted)
  + Luana Salzano: General English AM Plus (needs shunt)
  + Tsengelbayar Mendsaikhan: AY Afternoon (auto-shunted)
  + Deva Sofia Onorato: Intensive + IELTS (needs shunt)
  + Soumaya Bourguiba: General English PM (needs shunt)
  + BC 25002 Aleix Cervera Gonzalez: General English AM -- DUPLICATE
  + BC 25003 Aleix Cervera Gonzalez: General English AM -- DUPLICATE
  + Alin Merticariu: General English AM (needs shunt)
  + Anderson da Silva Martins: Life Pass Morning (needs shunt)
BC starting Aug 4 (already correct): Rafaela Da Silva Fonseca

NEW FINDING: Aleix Cervera Gonzalez (student 14596) BK 18225 CONFIRMED
  BC 25002: General English AM, Aug 3 to Sep 18, active=true
  BC 25003: General English AM, Aug 3 to Sep 18, active=true -- IDENTICAL DUPLICATE
  One must be deactivated before Aug 3.

Fix recipe (NOT YET RUN):
1. Query non-AY BCs starting Aug 3 for manual shunt:
   SELECT bc.id, bc.name, s.first_name, s.last_name FROM booking_courses bc
   JOIN bookings b ON b.id=bc.booking_id JOIN students s ON s.id=b.student_id
   WHERE bc.start_date=2026-08-03 AND bc.name NOT LIKE pct-Academic Year-pct;
2. UPDATE booking_courses SET start_date=2026-08-04 WHERE id IN (above ids); -- NOT YET RUN
3. Deactivate duplicate Aleix BC 25003:
   UPDATE booking_courses SET active=false WHERE id=25003; -- NOT YET RUN (confirm first)
4. Verify AY auto-shunt log for BCs 97, 1766, 24958, 24959.

Risk: Moderate -- 9 days; duplicate BC needs cleanup before Aug 3
Last checked: Sat 25 Jul 2026 UTC
