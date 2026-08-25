# Issue 38 — Addendum Sat 8 Aug 2026 (k) — CRITICAL: Mon 10 Aug zero-assignment alert

**Check:** 77th hourly — Sat 8 Aug 2026 UTC

ALL 17 Booking Courses starting Monday 10 Aug 2026 have ZERO class assignments (live DB query confirmed).

List — BC ID, Course, Student (ID), Booking:
BC 96 — Intensive General 30 — Alessandro Signorotti (82) — bk 88
BC 108 — Intensive General 30 — Lucia Borroni (92) — bk 98
BC 109 — Morning General — Maicol Moretti (93) — bk 99
BC 833 — Academic Year Morning — Settiyanee Duangjai (400) — bk 790
BC 1313 — Academic Year Afternoon — Ana Luiza De Sousa (744) — bk 1286
BC 1818 — Academic Year Morning — Natanael Reis Lourenco de Sales (1071) — bk 1631
BC 24915 — Academic Year Morning — Toshimi Hanakawa (877) — bk 18140
BC 24970 — Academic Year Afternoon — Tsengelbayar Mendsaikhan (948) — bk 18194
BC 25004 — General English AM Plus — Vincenzo Contu (14597) — bk 18226
BC 25005 — General English AM — Claudia Mereu (14598) — bk 18227
BC 25007 — Academic Year Morning — Nominjin Amartsogt (759) — bk 18229
BC 25024 — General English PM — Josimar Roberto (14612) — bk 18246
BC 25027 — Academic Year Morning — Jacqueline Olga Burgos (14614) — bk 18248
BC 25031 — Academic Year Morning — Brisia Garcia Roman (14617) — bk 18252
BC 25036 — General English AM — Jorge Perez Aldana (14619) — bk 18256
BC 25039 — General English PM Plus — Cristian Ravai (17) — bk 18259
BC 25042 — General English AM — Edith Nunes (1015) — bk 18262

Also: BC 25035 (Rakan Alghamdi, GE AY AM Plus, started Mon 3 Aug) still 0 SCAs — 5 days in.

Root cause: staff have not yet actioned the to-be-assigned queue for Monday starters.
Note: legacy BCs (96, 108, 109, 833, 1313, 1818) — check if student already in class from prior booking.

Fix (NOT YET RUN): Action required by Sunday evening / first thing Monday.
Step 1: SIS admin > Bookings > filter start_date=10 Aug. For legacy BCs, check existing SCAs.
Step 2: SIS admin > Classes > To Be Assigned. Assign all 17 students.
Step 3: BC 25035 Rakan Alghamdi — 5 days in. Check attendance sheets, create SCA manually.

Category: bookings / class assignments. Reversible. Blast radius: 17 students without class Monday.

Status: CRITICAL — NOT YET FIXED. Last checked: Sat 8 Aug 2026 UTC