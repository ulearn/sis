# Issue 38 — Addendum 5 Aug 2026 (g) — CRITICAL: Unassigned Classes Ending Friday

Reporter: Diego/Paul  Area: Holidays, Bookings, Classes  Sheet row: 40

22nd check Wed 5 Aug 2026 UTC — CRITICAL 2-day window: Booking Courses 88 and 25038 end Friday 7 Aug with 0 class assignments.

## CRITICAL: Booking Courses ending FRIDAY 7 Aug with 0 class assignments

**Booking Course 88** (Africa Mera Bachir, student 76): Morning General, booking 82 CONFIRMED, 0 class assignments — in school since Mon 3 Aug
**Booking Course 25038** (Eduardo Roche Diaz, student 14602): General English PM, booking 18258 CONFIRMED, 0 class assignments — in school since Mon 3 Aug

Both students attended Mon/Tue/Wed (3 days) with no class assignment. Attendance for those 3 days must be entered manually after assignment.

## Booking Course 24967 — Duplicate on booking 18179 (Gustavo Da Silva)

Booking Course 24955 (General English AM Plus, Jul 6-Aug 7, 2 class assignments) and Booking Course 24967 (General English AM, Jul 6-Aug 7, 0 class assignments) are both on booking 18179.
Booking Course 24967 appears created before the product was upgraded from AM to AM Plus. Deactivate Booking Course 24967 — do not assign.

## Booking Courses starting Sunday 10 Aug — assign by Friday

**Booking Course 25004** (Vincenzo Contu, student 14597, General English AM Plus, Aug 10-14): 0 class assignments.
**Booking Course 25005** (Claudia Mereu, student 14598, General English AM, Aug 10-14): 0 class assignments.

## Other Booking Courses (unchanged)

- Booking Course 24 (Amine Ibrani, ends Aug 14): booking 23 CANCELLED — deactivate, do not assign.
- Booking Course 1572 (Ganchimeg Ganbaatar, ends Aug 14): booking 1435 PENDING — cannot assign until paid.
- Legacy Booking Courses 1144/1305/1344/1591 (Academic Year Morning, CONFIRMED, 0 class assignments, end Aug 14):
  - BC 1144: ANAR-ERDENE BATBAYAR (booking 1124)
  - BC 1305: Nomin Nergui (booking 1282)
  - BC 1344: BAt-Orgil Baljinnyam (booking 1302)
  - BC 1591: Turbold Altankhuyag (booking 1450)
  - Likely migration artifacts — Neil to decide before assigning or deactivating.

## Fix Recipe (NOT YET RUN)

**Step 1 — IMMEDIATELY: Assign Africa Mera Bachir (Booking Course 88)**
SIS admin → Classes → To Be Assigned → Africa Mera Bachir → assign to Morning General class for week Aug 3-7.
Then manually enter attendance for Mon 3 Aug, Tue 4 Aug, Wed 5 Aug.

**Step 2 — IMMEDIATELY: Assign Eduardo Roche Diaz (Booking Course 25038)**
SIS admin → assign Booking Course 25038 to General English PM class for week Aug 3-7.
Then manually enter attendance for Mon 3 Aug, Tue 4 Aug, Wed 5 Aug.

**Step 3 — TODAY: Deactivate Booking Course 24967 (duplicate)**
NOT YET RUN: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24967;
Risk: Low. Booking Course 24955 has correct class assignments. Reversible.

**Step 4 — BY FRIDAY: Assign Booking Course 25004 (Vincenzo Contu)**
SIS admin → assign to AM Plus class starting Mon Aug 10.

**Step 5 — BY FRIDAY: Assign Booking Course 25005 (Claudia Mereu)**
SIS admin → assign to AM class starting Mon Aug 10.

**Step 6 — Deactivate Booking Course 24 (cancelled booking)**
NOT YET RUN: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24;

**Step 7 — Neil decides: legacy Booking Courses 1144/1305/1344/1591**
NOT YET RUN (Neil to confirm first): UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (1144, 1305, 1344, 1591);

## Risk

- Category: Bookings / Classes / Attendance
- Severity: Medium-High — 3 days untracked attendance for 2 confirmed students; course ends Friday
- Reversible: Steps 3/6/7 reversible; attendance entries are additive

**Status:** Pending — fix NOT RUN
**Last checked:** Wed 5 Aug 2026 UTC (22nd hourly run)