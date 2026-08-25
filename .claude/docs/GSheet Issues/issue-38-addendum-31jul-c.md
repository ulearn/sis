# Issue 38 — Aug Bank Holiday 2026-08-03 (13th check — PAST DEADLINE)

Reporter: PG · Area: Holidays, Bookings · Sheet row: 40

## Status: CRITICAL — Fix NOT Run — Past deadline — BH is Monday Aug 3

## Root cause (31 Jul 2026 - evening check)

school_closures has NO entry for 2026-08-03.

20 active BCs start Aug 3 total: 14 confirmed=true, 6 confirmed=false.

Confirmed=true (13 unique + duplicate BC 25003 of 25002):
- BC 88 Africa Mera Bachir (bk82) ends Aug 7
- BC 1755 Maria Giulia Serpi (bk1571) ends Aug 14
- BC 1766 Maria Eduarda Alves Paiva (bk1581) ends Sep 4
- BC 24908 Ai Tsunashima (bk18128) ends Aug 21
- BC 24956 Giampaolo Russo (bk18180) ends Sep 11
- BC 24958 Aurora Madril Oliveira Molina (bk18182) ends Feb 5 2027
- BC 24959 Diego Alves da Silva Molina (bk18183) ends Feb 5 2027
- BC 24964 Luana Salzano (bk18188) ends Aug 14
- BC 24984 Deva Sofia Onorato (bk18207) ends Aug 25
- BC 25002 Aleix Cervera Gonzalez (bk18225) ends Sep 18
- BC 25003 Aleix Cervera Gonzalez (bk18225) ends Sep 18 (DUPLICATE of 25002)
- BC 25010 Alin Merticariu (bk18232) ends Aug 28
- BC 25016 Anderson da Silva Martins (bk18238) ends Jan 22 2027
- BC 25028 Edgar Gilabert Mata (bk18249) ends Aug 28

Confirmed=false (verify in HubSpot DO NOT shunt blindly):
- BC 97 Gustavo Ferreira
- BC 24627 Angelica Guérin
- BC 24999 Soumaya Bourguiba
- BC 25029 Monica Breier Fiametti
- BC 25030 Tayron Sanches Feijo Filho
- BC 25033 Jingyi Yang

BC 25006 Marina Larripa (bk18228, confirmed=true): ends Aug 3 ** must shift end to Aug 4 **

## Fix recipe (NOT YETH Run)

Step 1 — Insert Aug Bank Holiday closure:
  SQL (NOT YET RUN):
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish public holiday', true, NOW());

Step 2 — Shunt 13 confirmed BCs (exclude duplicate 25003):
  SQL (NOT YET RUN):
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id IN (88,1755,1766,24908,24956,24958,24959,24964,24984,25002,25010,25016,25028)
    AND start_date = '2026-08-03';
  Then review end dates for short courses (e.g. BC 88 ends Aug 7 should become Aug 8).

Step 3 — Push BC 25006 end (Marina Larripa):
  SQL (NOT YET RUN):
  UPDATE booking_courses SET end_date = '2026-08-04', updated_at = NOW() WHERE id = 25006;

Step 4 — Deactivate duplicate BC 25003:
  SQL (NOT YET RUN):
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 25003;

Step 5 — Verify 6 unconfirmed BCs in HubSpot; shunt or deactivate as appropriate.

## Risk: CRITICAL — Bookings. Reversible. 13 confirmed students at risk of first class on public holiday.
## Status: OPEN — fix NOT Run — Last checked: Fri 31 Jul 2026 UTC (13th check)
