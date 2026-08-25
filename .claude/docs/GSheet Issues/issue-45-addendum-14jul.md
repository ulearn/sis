Issue 45 Addendum -- 14 July 2026 (64th check)

64th check 2026-07-14 TUE UTC

CRITICAL: 8 booking courses end Friday 17 July with zero class assignments (confirmed fresh DB)

All 8 confirmed zero SCAs this run:

1. BC26 (Academic Year Morning, Kritchana Ratcha-Anan, student 21): zero SCAs, active=true, ending 17 Jul
2. BC95 (Morning General Plus, Florian Baury, student 81): zero SCAs, ending 17 Jul -- 12+ school days missed
3. BC1719 (Academic Year Afternoon, Maria Magdalena Hermosilla Ogaz, student 992): zero SCAs, ending 17 Jul -- 6-month course entirely untracked
4. BC24946 (General English AM, Lunel Dubost, student 14566): zero SCAs, ending 17 Jul -- Day 2 of course
5. BC24985 (General English PM, Silvia Cecilia Maza Valladolid, student 14583): zero SCAs, ending 17 Jul
6. BC24986 (General English PM, Gladis Patricia Maza Valladolid, student 14584): zero SCAs, ending 17 Jul
7. BC24992 (General English AM, Luz Maria Sobrino Blanco, student 14589): zero SCAs, ending 17 Jul
8. BC24994 (General English AM, Petru Ous, student 14591): zero SCAs, ending 17 Jul

3 calendar days to Friday 17 July deadline.

Stale active booking courses ended 10 July (4 days stale, all active=true)

18 total: BC103, BC1455, BC1615, BC1650, BC1653, BC1697, BC1773, BC24630, BC24631, BC24670, BC24872, BC24907, BC24931, BC24933, BC24934, BC24936, BC24937, BC24968

Deactivate all 18 (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE id IN (103,1455,1615,1650,1653,1697,1773,24630,24631,24670,24872,24907,24931,24933,24934,24936,24937,24968);

Fix recipe -- NOT YET RUN

Priority 1 -- CRITICAL: Assign all 8 before Friday 17 July
Via SIS Admin > Classes > To Be Assigned -- find each student and assign:
1. Kritchana Ratcha-Anan (student 21, BC26 AY Morning)
2. Florian Baury (student 81, BC95 Morning General Plus)
3. Maria Magdalena Hermosilla Ogaz (student 992, BC1719 AY Afternoon)
4. Lunel Dubost (student 14566, BC24946 General English AM)
5. Silvia Cecilia Maza Valladolid (student 14583, BC24985 General English PM)
6. Gladis Patricia Maza Valladolid (student 14584, BC24986 General English PM)
7. Luz Maria Sobrino Blanco (student 14589, BC24992 General English AM)
8. Petru Ous (student 14591, BC24994 General English AM)

Priority 2 -- Housekeeping: Deactivate 18 stale Jul10 booking courses (SQL above, reversible)

Risk: SCA inserts reversible, low risk. Blast radius: 8 students + 18 stale BC deactivations.

Status: CRITICAL -- 3 days to Friday 17 July deadline. Fix NOT RUN.
Last checked: 2026-07-14 TUE UTC (64th check, hourly bot).
---

65th check 2026-07-14 TUE UTC (later run same day)

CONFIRMED UNCHANGED. All 8 BCs ending Fri Jul17 still have zero SCAs. 18 stale Jul10 BCs still active. Fix NOT RUN.

---

66th check 2026-07-14 TUE UTC (later run same day)

CONFIRMED UNCHANGED. All 8 BCs ending Fri 17 Jul still have zero SCAs. 18 stale Jul10 BCs still active. Fix NOT RUN.

---

67th check 2026-07-14 TUE UTC (later run same day)

CONFIRMED UNCHANGED. All 8 BCs ending Fri 17 Jul still have zero SCAs. 3 days remain.

Zero-SCA students (fresh DB confirmed):
1. BC26 bk25 - Kritchana Ratcha-Anan (s21) - PENDING confirmed=false
2. BC95 bk87 - Florian Baury (s81) - PENDING confirmed=false
3. BC1719 bk1543 - Maria Magdalena Hermosilla Ogaz (s992) - CONFIRMED confirmed=true
4. BC24946 bk18171 - Lunel Dubost (s14566) - CONFIRMED confirmed=true
5. BC24985 bk18208 - Silvia Cecilia Maza Valladolid (s14583) - PENDING confirmed=false
6. BC24986 bk18209 - Gladis Patricia Maza Valladolid (s14584) - PENDING confirmed=false
7. BC24992 bk18215 - Luz Maria Sobrino Blanco (s14589) - PENDING confirmed=false
8. BC24994 bk18217 - Petru Ous (s14591) - PENDING confirmed=false

Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (67th check, hourly bot).

---

68th check 2026-07-14 TUE UTC (later run same day)

CONFIRMED UNCHANGED. All 8 booking courses ending Fri 17 Jul still have zero class assignments. 3 days remain.

Confirmed enrolled with 0 SCAs (critical — in live class with no tracking):
- BC1719 María Magdalena Hermosilla Ogaz (student 992, AY Afternoon) — status=CONFIRMED, confirmed=true
- BC24946 Lunel Dubost (student 14566, General English AM) — status=CONFIRMED, confirmed=true

Pending (may not yet have enrolled):
- BC26 Kritchana Ratcha-Anan (student 21) — PENDING
- BC95 Florian Baury (student 81) — PENDING
- BC24985 Silvia Cecilia Maza Valladolid (student 14583) — PENDING
- BC24986 Gladis Patricia Maza Valladolid (student 14584) — PENDING
- BC24992 Luz Maria Sobrino Blanco (student 14589) — PENDING
- BC24994 Petru Ous (student 14591) — PENDING

Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (68th check, hourly bot).

---

69th check 2026-07-14 TUE UTC (this run)

CONFIRMED UNCHANGED. All 8 booking courses ending Fri 17 Jul still have zero class assignments (3 days remain).

19 total active BCs end Jul 17. 11 have SCAs assigned. 8 STILL ZERO:
1. BC26 (AY Morning) - Kritchana Ratcha-Anan (student 21) - PENDING
2. BC95 (Morning General Plus) - Florian Baury (student 81) - PENDING
3. BC1719 (AY Afternoon) - Maria Magdalena Hermosilla Ogaz (student 992) - CONFIRMED
4. BC24946 (General English AM) - Lunel Dubost (student 14566) - CONFIRMED
5. BC24985 (General English PM) - Silvia Cecilia Maza Valladolid (student 14583) - PENDING
6. BC24986 (General English PM) - Gladis Patricia Maza Valladolid (student 14584) - PENDING
7. BC24992 (General English AM) - Luz Maria Sobrino Blanco (student 14589) - PENDING
8. BC24994 (General English AM) - Petru Ous (student 14591) - PENDING

Note: 11 other students ending Fri 17 Jul DO have SCAs (Aitana Lopez, Kanna Hasegawa, Raquel Alvarez Fernandez, Yeongjae Jang, Ariuntsetseg Gansukh, Uuganbayar Khureltogoo, Erika Watanabe, Maria Eduarda Alves Paiva, Manuel Karanauskas, Geyza Covre, Hugo Lopez Tamayo).

Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (69th check, hourly bot).

---
70th check 2026-07-14 Tue UTC (run 5)

CONFIRMED UNCHANGED. 8 booking courses ending Fri 17 Jul with zero class assignments.
Assigned 11 of 19. 3 calendar days remain.

Still unassigned:
- BC26 (Kritchana Ratcha-Anan, s21, AY Morning)
- BC95 (Florian Baury, s81, Morning General Plus)
- BC1719 (Maria Magdalena Hermosilla Ogaz, s992, AY Afternoon)
- BC24946 (Lunel Dubost, s14566, General English AM)
- BC24985 (Silvia Maza, s14583, General English PM)
- BC24986 (Gladis Maza, s14584, General English PM)
- BC24992 (Luz Sobrino, s14589, General English AM)
- BC24994 (Petru Ous, s14591, General English AM)

Fix NOT RUN. NEIL: Via SIS Admin > Classes > To Be Assigned.

---
71st check 2026-07-14 TUE UTC

CHANGE THIS RUN: Booking 18217 (Petru Ous, student 14591) -- status now CONFIRMED confirmed=true, EUR 202/202 fully paid (was PENDING in prior checks). Still zero class assignments.

All 8 booking courses ending Fri 17 Jul have zero class assignments (fresh DB confirmed):
1. BC26 (AY Morning) -- Kritchana Ratcha-Anan (student 21, bk25) -- PENDING
2. BC95 (Morning General Plus) -- Florian Baury (student 81, bk87) -- PENDING EUR 1550/null
3. BC1719 (AY Afternoon) -- Maria Magdalena Hermosilla Ogaz (student 992, bk1543) -- CONFIRMED EUR 1500/1356
4. BC24946 (General English AM) -- Lunel Dubost (student 14566, bk18171) -- CONFIRMED EUR 206.13/206.13
5. BC24985 (General English PM) -- Silvia Cecilia Maza Valladolid (student 14583, bk18208) -- PENDING EUR 265/0
6. BC24986 (General English PM) -- Gladis Maza Valladolid (student 14584, bk18209) -- PENDING EUR 265/0
7. BC24992 (General English AM) -- Luz Maria Sobrino Blanco (student 14589, bk18215) -- PENDING EUR 202/0
8. BC24994 (General English AM) -- Petru Ous (student 14591, bk18217) -- CONFIRMED EUR 202/202 (NEW: confirmed this run)

3 calendar days to Friday 17 July deadline. Fix NOT RUN. NEIL: SIS Admin > Classes > To Be Assigned.

---
72nd check 2026-07-14 TUE UTC (this run)

CONFIRMED UNCHANGED (fresh DB). 19 booking courses end Fri 17 July; 11 have SCAs; 8 still have zero.

Zero-SCA students (3 CONFIRMED + 5 PENDING):
1. BC26  (Academic Year Morning)    — Kritchana Ratcha-Anan (student 21)              — PENDING
2. BC95  (Morning General Plus)     — Florian Baury (student 81)                       — PENDING
3. BC1719 (Academic Year Afternoon) — Maria Magdalena Hermosilla Ogaz (student 992)    — CONFIRMED
4. BC24946 (General English AM)     — Lunel Dubost (student 14566)                    — CONFIRMED
5. BC24985 (General English PM)     — Silvia Cecilia Maza Valladolid (student 14583)  — PENDING
6. BC24986 (General English PM)     — Gladis Patricia Maza Valladolid (student 14584) — PENDING
7. BC24992 (General English AM)     — Luz Maria Sobrino Blanco (student 14589)        — PENDING
8. BC24994 (General English AM)     — Petru Ous (student 14591)                       — CONFIRMED (confirmed earlier today)

3 calendar days to Friday 17 July. Fix NOT RUN. NEIL: SIS Admin > Classes > To Be Assigned — prioritise BC1719, BC24946, BC24994.

---
73rd check 2026-07-14 TUE UTC (this run)

CONFIRMED UNCHANGED (fresh DB). All 8 booking courses ending Fri 17 Jul still have zero class assignments. 3 calendar days remain.

Zero-SCA students:
1. BC26  (Academic Year Morning)    — Kritchana Ratcha-Anan (student 21)              — PENDING
2. BC95  (Morning General Plus)     — Florian Baury (student 81)                       — PENDING
3. BC1719 (Academic Year Afternoon) — Maria Magdalena Hermosilla Ogaz (student 992)    — CONFIRMED
4. BC24946 (General English AM)     — Lunel Dubost (student 14566)                    — CONFIRMED
5. BC24985 (General English PM)     — Silvia Cecilia Maza Valladolid (student 14583)  — PENDING
6. BC24986 (General English PM)     — Gladis Patricia Maza Valladolid (student 14584) — PENDING
7. BC24992 (General English AM)     — Luz Maria Sobrino Blanco (student 14589)        — PENDING
8. BC24994 (General English AM)     — Petru Ous (student 14591)                       — CONFIRMED

Fix NOT RUN. NEIL: SIS Admin > Classes > To Be Assigned — prioritise BC1719, BC24946, BC24994.

---
74th check 2026-07-14 TUE UTC

CONFIRMED UNCHANGED (fresh DB). All 8 booking courses ending Fri 17 Jul still have zero class assignments. 3 calendar days remain.

Zero-SCA students (3 CONFIRMED enrolled + 5 PENDING):
1. BC26  (Academic Year Morning)    — Kritchana Ratcha-Anan (student 21)              — PENDING
2. BC95  (Morning General Plus)     — Florian Baury (student 81)                       — PENDING
3. BC1719 (Academic Year Afternoon) — Maria Magdalena Hermosilla Ogaz (student 992)    — CONFIRMED
4. BC24946 (General English AM)     — Lunel Dubost (student 14566)                    — CONFIRMED
5. BC24985 (General English PM)     — Silvia Cecilia Maza Valladolid (student 14583)  — PENDING
6. BC24986 (General English PM)     — Gladis Patricia Maza Valladolid (student 14584) — PENDING
7. BC24992 (General English AM)     — Luz Maria Sobrino Blanco (student 14589)        — PENDING
8. BC24994 (General English AM)     — Petru Ous (student 14591)                       — CONFIRMED

Fix NOT RUN. NEIL: SIS Admin > Classes > To Be Assigned — prioritise BC1719 (Maria Magdalena), BC24946 (Lunel Dubost), BC24994 (Petru Ous).
Last checked: 2026-07-14 TUE UTC (74th check, hourly bot).
