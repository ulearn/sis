# Issue 38 - Class Assignment Queue (20th check, URGENT)

Reporter: NM | Area: Holidays, Bookings etc. | Sheet row 40 | Last checked: 2026-08-05 UTC (20th check)

NEW THIS CHECK: Booking statuses confirmed for Aug 14 BCs.
Two anomalies (cancelled/pending bookings); two new urgent BCs starting Monday Aug 10.

== URGENT - BCs end Friday 7 Aug (2 days) ==

BC 88 - Africa Mera Bachir (booking 82, CONFIRMED):
- Course: Morning General, started 2026-08-03, ends 2026-08-07
- 0 class assignments - ASSIGN TODAY

BC 25038 - Eduardo Roche Diaz (booking 18258, CONFIRMED):
- Course: General English PM, started 2026-08-03, ends 2026-08-07
- 0 class assignments - ASSIGN TODAY

BC 24967 - Gustavo Da Silva (booking 18179, CONFIRMED) - DUAL ENROLMENT ANOMALY:
- Course: General English AM, started 2026-07-06, ends 2026-08-07
- 0 class assignments
- SAME booking 18179 also has BC 24955 (General English AM Plus, 2 class assignments - already assigned)
- BC 24967 is likely a duplicate - do NOT assign; deactivate if redundant:
    UPDATE booking_courses SET active = false WHERE id = 24967;

BC 24955 - Gustavo Da Silva (booking 18179, CONFIRMED) - ALREADY ASSIGNED, OK:
- Course: General English AM Plus, 2 class assignments (class 7 + class 8) - no action needed.

== BCs ending 14 Aug - NEW BOOKING STATUS FINDINGS ==

BC 24 - Amine Ibrani (booking 23, CANCELLED) - ANOMALY - DO NOT ASSIGN:
- Course: Academic Year Afternoon, started 2026-02-23, ends 2026-08-14
- Booking 23 is CANCELLED - this BC is a zombie; deactivate:
    UPDATE booking_courses SET active = false WHERE id = 24;

BC 1572 - Ganchimeg Ganbaatar (booking 1435, PENDING) - CANNOT ASSIGN YET:
- Course: Academic Year Afternoon, started 2026-02-23, ends 2026-08-14
- Booking 1435 is PENDING - payment must be received before assigning.
- Action: chase payment for booking 1435, then assign BC 1572.

BC 25004 - Vincenzo Contu (booking 18226, CONFIRMED) - ASSIGN BEFORE MON 10 AUG:
- Course: General English AM Plus, starts 2026-08-10, ends 2026-08-14
- 0 class assignments - course starts Monday; assign by end of day Friday.

BC 25005 - Claudia Mereu (booking 18227, CONFIRMED) - ASSIGN BEFORE MON 10 AUG:
- Course: General English AM, starts 2026-08-10, ends 2026-08-14
- 0 class assignments - course starts Monday; assign by end of day Friday.

BCs 1144 / 1305 / 1344 / 1591 - AY courses ending Aug 14, 0 class assignments:
- BC 1144 (ANAR-ERDENE BATBAYAR, booking 1124 CONFIRMED, AY Morning, started 2026-02-23)
- BC 1305 (Nomin Nergui, booking 1282 CONFIRMED, AY Morning, started 2026-04-27)
- BC 1344 (Bat-Orgil Baljinnyam, booking 1302 CONFIRMED, AY Morning, started 2026-02-23)
- BC 1591 (Turbold Altankhuyag, booking 1450 CONFIRMED, AY Morning, started 2026-02-23)
- Long-running AY courses with no class assignment history - likely migrated from Fidelo without SCA records.
- If students actively attending: backfill class assignments from current date.

Fix Recipe Summary (NOT YET RUN):

Priority 1 - TODAY (Fri 5 Aug):
  1. Assign BC 88 (Africa Mera Bachir) to Morning General class
  2. Assign BC 25038 (Eduardo Roche Diaz) to PM General class
  3. Investigate BC 24967 vs BC 24955 (Gustavo) - deactivate 24967 if duplicate

Priority 2 - By end of day Fri (before Mon 10 Aug):
  4. Assign BC 25004 (Vincenzo Contu) to AM Plus class
  5. Assign BC 25005 (Claudia Mereu) to AM General class
  6. Deactivate BC 24: UPDATE booking_courses SET active = false WHERE id = 24;
  7. Chase payment for booking 1435 (Ganchimeg Ganbaatar), then assign BC 1572

Priority 3 - By Mon 10 Aug:
  8. Assess BCs 1144/1305/1344/1591 - if attending, backfill class assignments

Risk: bookings / class assignments | Reversible | Blast radius: up to 8 students; 2 miss final 2 days if BCs 88+25038 not assigned today.
Status: OPEN - 20th check 2026-08-05 UTC. NOT YET RUN. URGENT - BCs 88 and 25038 end Friday.