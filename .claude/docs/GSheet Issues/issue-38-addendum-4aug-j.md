# Issue 38 — Stale & Unassigned Booking Courses (14th check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Holidays, Bookings | Sheet row: 40

## Root Cause (verified 2026-08-04 UTC, 14th check — UNCHANGED from 13th check)

### URGENT — ends Thu 7 Aug 2026 (3 days) — 0 class assignments
- BC 88: Africa Mera Bachir (student 76, booking 82), Morning General
- BC 24967: Gustavo Da Silva (student 14570, booking 18179), General English AM — booking 18179 also has BC 24955 (AM Plus, 2 SCAs) — possible duplicate; human decision needed
- BC 25038: Eduardo Roche Diaz (student 14602, booking 18258), General English PM

### Ends Fri 14 Aug 2026 — 0 class assignments (8 total, unchanged)
- BC 24: Amine Ibrani (student 19), Academic Year Afternoon
- BC 1144: Anar-Erdene Batbayar (student 588), Academic Year Morning
- BC 1305: Nomin Nergui (student 740), Academic Year Morning
- BC 1344: Bat-Orgil Baljinnyam (student 760), Academic Year Morning
- BC 1572: Ganchimeg Ganbaatar (student 886), Academic Year Afternoon
- BC 1591: Turbold Altankhuyag (student 901), Academic Year Morning
- BC 25004: Vincenzo Contu, General English AM Plus
- BC 25005: Claudia Mereu, General English AM

### Stale / housekeeping
- BC 25006 (Marina Larripa, ended 2026-08-03): 1 day stale, active = true
- Aug Bank Holiday 2026-08-03: absent from school_closures; add 2027+ to prevent recurrence

## Fix Recipe (NOT YET RUN)

### 1. URGENT — assign or resolve BCs ending Thu 7 Aug TODAY
BC 24967 (Gustavo): check if duplicate of BC 24955 on booking 18179.
  If duplicate: UPDATE booking_courses SET active = false WHERE id = 24967;
  If genuine second course: assign via SIS admin.
BC 88 (Africa Mera Bachir, student 76): assign Morning General via SIS admin.
BC 25038 (Eduardo Roche Diaz, student 14602): assign General English PM via SIS admin.

### 2. Assign Aug 14 BCs by Thu 13 Aug (via SIS admin)
BCs 24, 1144, 1305, 1344, 1572, 1591, 25004, 25005.
Note: BC 24 (Amine Ibrani, student 19, AY Afternoon) — verify attendance status before assigning.

### 3. Deactivate stale BC (NOT YET RUN)
  UPDATE booking_courses SET active = false WHERE id = 25006;

### 4. Add Aug Bank Holiday future years (prevention, NOT YET RUN)
  INSERT INTO school_closures (name, start_date, end_date) VALUES
  ('August Bank Holiday', '2027-08-02', '2027-08-02'),
  ('August Bank Holiday', '2028-08-07', '2028-08-07'),
  ('August Bank Holiday', '2029-08-06', '2029-08-06'),
  ('August Bank Holiday', '2030-08-05', '2030-08-05');

## Risk / Category
- Assignments (BCs 88/25038/24967): attendance untracked — URGENT; reversible
- Aug 14 BCs: medium urgency; reversible
- Stale BC deactivation: cosmetic, reversible

## Status: OPEN — fix NOT RUN | Last checked: 2026-08-04 UTC (14th check)