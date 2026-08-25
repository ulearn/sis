Issue 38 — Aug Bank Holiday 2026 (73rd check, 2nd on Aug 3)
Sheet row: 40

Status: Mon 3 Aug 2026 UTC, 2nd check
BANK HOLIDAY IS TODAY. SHUNT STILL NOT RUN.

Fresh DB: school_closures = 0 entries Jul-Sep 2026. Aug BH 2026-08-03 absent.
21 active booking courses still start 2026-08-03 — ALL unshunted.
First teaching day this week: Tue 4 Aug.
Unchanged from 1st-today (issue-38-addendum-3aug.md).

21 BCs starting Aug 3 (fresh query):
BC 88 Morning General — Africa Mera Bachir bk82
BC 97 Academic Year Morning — Gustavo Ferreira bk89
BC 1755 Morning General — Maria Giulia Serpi bk1571
BC 1766 AY Renewal Morning — Maria Eduarda Alves Paiva bk1581
BC 24627 Morning General — Angelica Guerin bk17853
BC 24908 General English AM — Ai Tsunashima bk18128
BC 24956 General English AM — Giampaolo Russo bk18180
BC 24958 AY Morning — Aurora Madril Oliveira Molina bk18182
BC 24959 AY Morning — Diego Alves da Silva Molina bk18183
BC 24964 General English AM Plus — Luana Salzano bk18188
BC 24984 Intensive General English & IELTS — Deva Sofia Onorato bk18207
BC 24999 General English PM — Soumaya Bourguiba bk18222
BC 25002 General English AM — Aleix Cervera Gonzalez bk18225
BC 25003 General English AM — Aleix Cervera Gonzalez bk18225 (DUPLICATE — deactivate)
BC 25010 General English AM — Alin Merticariu bk18232
BC 25016 Life Pass Morning — Anderson da Silva Martins bk18238
BC 25028 Intensive General English — Edgar Gilabert Mata bk18249
BC 25029 AY Morning — Monica Breier Fiametti bk18250
BC 25030 General English PM — Tayron Sanches Feijo Filho bk18251
BC 25033 General English PM — Jingyi Yang bk18254
BC 25035 General English AY AM Plus — Rakan Alghamdi bk17915

NOTE: BC 24697 (Rakan stale AY Morning) NOT in the 21 — may be deactivated already.
Verify: SELECT active FROM booking_courses WHERE id = 24697;

Fix recipe (NOT YET RUN) — full SQL in issue-38-addendum-3aug.md:
1. Deactivate BC 25003 (duplicate Aleix Cervera Gonzalez).
2. If BC 24697 still active, deactivate it.
3. INSERT school_closures: August Bank Holiday, 2026-08-03 to 2026-08-03, is_paid_holiday=false.
4. UPDATE booking_courses SET start_date=2026-08-04 WHERE start_date=2026-08-03 AND active=true;
5. Create SCAs for Aug 4 week: Giampaolo BC24956, Aurora BC24958, Diego BC24959, Rakan BC25035.

Risk: bookings + classes — medium blast radius ~19 students. Reversible.
Status: NOT RUN — 73rd check, 2nd Mon 3 Aug 2026 UTC.