Issue 38 — Addendum 5 Aug 2026 (f) — CRITICAL: Unassigned Classes Ending Friday

Reporter: Diego/Paul  Area: Holidays, Bookings, Classes  Sheet row: 40

21st check Wed 5 Aug 2026 UTC — CRITICAL 2-day window: BCs 88 and 25038 end Friday 7 Aug with 0 class assignments.

CRITICAL: BCs ending FRIDAY 7 Aug with 0 SCAs

BC 88 (Africa Mera Bachir, student 76): Morning General, booking 82 CONFIRMED, 0 SCAs — in school since Mon 3 Aug
BC 25038 (Eduardo Roche Diaz, student 14602): General English PM, booking 18258 CONFIRMED, 0 SCAs — in school since Mon 3 Aug
Both students attended Mon/Tue/Wed with no class assignment. Attendance for those 3 days must be entered manually after assignment.

BC 24967 — Likely duplicate on booking 18179 (Gustavo Da Silva)
BC 24955 (General English AM Plus, Jul 6-Aug 7, 2 SCAs) and BC 24967 (General English AM, Jul 6-Aug 7, 0 SCAs) are both on booking 18179.
BC 24967 appears created before the product was upgraded from AM to AM Plus. Deactivate BC 24967 — do not assign.

BCs starting Sunday 10 Aug — assign by Friday
BC 25004 (Vincenzo Contu, student 14597, General English AM Plus, Aug 10-14): 0 SCAs.
BC 25005 (Claudia Mereu, student 14598, General English AM, Aug 10-14): 0 SCAs.

Other BCs (unchanged)
BC 24 (Amine Ibrani, booking 23 CANCELLED): deactivate.
BC 1572 (Ganchimeg Ganbaatar, booking 1435 PENDING): cannot assign until paid.
Legacy BCs 1144/1305/1344/1591 (AY Morning, CONFIRMED, 0 SCAs, end Aug 14):
  BC 1144: ANAR-ERDENE BATBAYAR (booking 1124)
  BC 1305: Nomin Nergui (booking 1282)
  BC 1344: BAt-Orgil Baljinnyam (booking 1302)
  BC 1591: Turbold Altankhuyag (booking 1450)
  Likely migration artifacts — Neil to decide before assigning.

Fix recipe (NOT YET RUN)

Step 1 — TODAY: Assign Africa Mera Bachir (BC 88)
SIS admin > Classes > To Be Assigned > Africa Mera Bachir > assign to Morning General class for week Aug 3-7.
Then manually enter attendance for Mon 3 Aug through today (Wed 5 Aug).

Step 2 — TODAY: Assign Eduardo Roche Diaz (BC 25038)
SIS admin > assign BC 25038 to General English PM class for week Aug 3-7.
Then manually enter attendance for Mon 3 Aug through today.

Step 3 — TODAY: Deactivate BC 24967 (duplicate)
NOT YET RUN: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24967;
Risk: Low. BC 24955 has correct SCAs. Reversible.

Step 4 — BY FRIDAY: Assign BC 25004 (Vincenzo Contu)
SIS admin > assign to AM Plus class starting Mon Aug 10.

Step 5 — BY FRIDAY: Assign BC 25005 (Claudia Mereu)
SIS admin > assign to AM class starting Mon Aug 10.

Step 6 — Deactivate BC 24 (cancelled)
NOT YET RUN: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24;

Step 7 — Neil decides: legacy BCs 1144/1305/1344/1591
NOT YET RUN (Neil to confirm first): UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (1144, 1305, 1344, 1591);

Risk: Category: Bookings / Classes / Attendance. Medium — 3 days untracked attendance for 2 students. Reversible.
Last checked: Wed 5 Aug 2026 UTC (21st hourly run)