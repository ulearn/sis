# Issue 45 — Stale Booking Courses Blocking Arrivals (UPDATED: Jul-17 Batch)
Reporter: Staff (renewal students not in arrivals list)  |  Area: Renewal Students  |  Sheet row: 47

## Symptom
Returning/renewal students not appearing in arrivals list. Their previous courses are still
active=true, which suppresses their new courses from the list.

## Root Cause (Thu 30 Jul 2026 UTC — 2nd check this day)

### Batch 1: 11 booking courses ended 2026-07-24 (now 6 days stale) — UNCHANGED
BC24776  Mario Roggi
BC1781   José Geraldo Cursino de Moura Neto
BC25011  Eduardo Roche Diaz
BC20     Lalita Champakhong
BC81     Pietro Colombo
BC24620  Jade Ribeiro
BC24606  Martina Tartaro (booking has 2 BCs: 24606 + 24828)
BC24828  Martina Tartaro
BC1792   Nicole Valentina Rueda Mendoza
BC24989  Marcos Ábrego Tofé
BC37     Ralph Belizaire Calderón

### Batch 2: 15 booking courses ended 2026-07-17 (now 13 days stale) — NEW this check
BC1771   Geyza Covre
BC1737   Erika Watanabe
BC7      Aitana López
BC1294   Kanna Hasegawa
BC1770   Manuel Karanauskas
BC1765   Maria Eduarda Alves Paiva (also has BC1766 starting 2026-08-03 — see issue 38)
BC1718   Uuganbayar Khureltogoo
BC26     Kritchana RATCHA-ANAN
BC1708   Ariuntsetseg Gansukh
BC24960  Hugo Lopez Tamayo
BC1681   Yeongjae Jang
BC1669   Raquel Álvarez Fernández
BC95     Florian Baury
BC1719   María Magdalena Hermosilla Ogaz
BC24946  Lunel Dubost

### Legacy
BC505    Tuguldur Otgonbaatar (ended Aug 2025, still active)

### Scale
Total booking courses with active=true and end_date < 2026-07-30: 24,449
(Most are historical/legacy from Fidelo import era. Systemic nightly cleanup needed.)

## Fix Recipe (NOT YET RUN)

### Step 1 — Deactivate 2026-07-24 batch (11 BCs)
  UPDATE booking_courses SET active=false
  WHERE id IN (24776,1781,25011,20,81,24620,24606,24828,1792,24989,37);
  -- Expected: 11 rows

### Step 2 — Deactivate 2026-07-17 batch (15 BCs)
  UPDATE booking_courses SET active=false
  WHERE id IN (1771,1737,7,1294,1770,1765,1718,26,1708,24960,1681,1669,95,1719,24946);
  -- Expected: 15 rows

### Step 3 — Deactivate BC505 (legacy Tuguldur)
  UPDATE booking_courses SET active=false WHERE id=505;
  -- Expected: 1 row

### Step 4 — Verify
  SELECT COUNT(*) FROM booking_courses
  WHERE end_date <= '2026-07-24' AND active=true
  AND id IN (24776,1781,25011,20,81,24620,24606,24828,1792,24989,37);
  -- Expected: 0

### Step 5 (Optional) — Systemic cleanup of 24k+ legacy stale BCs
This is a larger project. A safe approach:
  -- Preview only (do not run without review):
  SELECT COUNT(*) FROM booking_courses WHERE end_date < '2026-01-01' AND active=true;
  -- If count is acceptable, deactivate old ones in batches

## Risk / Category
- Category: bookings / data hygiene — reversible
- Blast radius: 27 BCs (26 recent + BC505)
- Reversible: UPDATE back to active=true per BC id
- Note: Maria Eduarda Alves Paiva (BC1765, ended Jul 17) also has BC1766 starting Aug 3
  — confirm BC1766 arrivals appear correctly after deactivating BC1765

## Status
OPEN — 26 recent stale BCs + BC505 + 24k+ legacy — fix NOT RUN
Last checked: Thu 30 Jul 2026 UTC (2nd check)