# Issue 38 — Addendum 4 Aug 2026 (check 13i) — 3 new Aug 14 BCs + Gustavo duplicate

Reporter: AC | Area: Holidays, Bookings | Sheet row: 40 | Last checked: Tue 4 Aug 2026 UTC (13th check)

## New Findings This Check (vs check 12h earlier today)

### 3 additional unassigned BCs ending Aug 14 — not in previous H

- BC 24 (Amine Ibrani, student 19): Academic Year Afternoon, started 2026-02-23, ends 2026-08-14 — 0 class assignments
- BC 25004 (Vincenzo Contu): General English AM Plus, ends 2026-08-14 — 0 class assignments
- BC 25005 (Claudia Mereu): General English AM, ends 2026-08-14 — 0 class assignments

Aug 14 total unassigned is now 8 (was 5 in previous recipe).

### Gustavo Da Silva duplicate BC on same booking

Booking 18179 (student 14570) has TWO active booking courses both ending 2026-08-07:

- BC 24955: General English AM Plus, started 2026-07-06 — 2 class assignments (assigned, correct)
- BC 24967: General English AM, started 2026-07-06 — 0 class assignments (URGENT)

May be a duplicate; human review needed before assigning or deactivating BC 24967.

## Root Cause Summary (live evidence)

### URGENT — ends Fri 7 Aug 2026 (3 days) — 0 assignments

- BC 88: Africa Mera Bachir (student 76, booking 82), Morning General
- BC 24967: Gustavo Da Silva (student 14570, booking 18179), General English AM
- BC 25038: Eduardo Roche Diaz (student 14602, booking 18258), General English PM

### Ends Fri 14 Aug 2026 — 0 assignments (8 total, 3 new)

- BC 24: Amine Ibrani (student 19) AY Afternoon — NEW
- BC 1144: ANAR-ERDENE BATBAYAR (student 588) AY Morning
- BC 1305: Nomin Nergui (student 740) AY Morning
- BC 1344: Bat-Orgil Baljinnyam (student 760) AY Morning
- BC 1572: Ganchimeg Ganbaatar (student 886) AY Afternoon
- BC 1591: Turbold Altankhuyag (student 901) AY Morning
- BC 25004: Vincenzo Contu, General English AM Plus — NEW
- BC 25005: Claudia Mereu, General English AM — NEW

### Other carried-forward items

- BC 25003 (Aleix Cervera): duplicate of BC 25002 — deactivate only, do not assign
- BC 25006 (Marina Larripa, ended 2026-08-03): active = true — 1 day stale
- Aug BH 2026-08-03 absent from school_closures (past; BC 24956 Giampaolo started on BH)

## Fix Recipe (NOT YET RUN)

### 1. URGENT: Assign or resolve BCs ending Fri 7 Aug TODAY

BC 24967 (Gustavo): check if duplicate of BC 24955 on booking 18179.
If duplicate: UPDATE booking_courses SET active = false WHERE id = 24967;
If genuine second course: assign via SIS admin.

BC 88 (Africa Mera Bachir, student 76): assign Morning General via SIS admin.
BC 25038 (Eduardo Roche Diaz, student 14602): assign General English PM via SIS admin.

### 2. Assign Aug 14 BCs by Thu 13 Aug

BCs 24, 1144, 1305, 1344, 1572, 1591, 25004, 25005 via SIS admin.
Note: BC 24 (Amine Ibrani, student 19, AY) — verify still attending before assigning.

### 3. Deactivate stale/duplicate BCs (NOT YET RUN)

  UPDATE booking_courses SET active = false WHERE id IN (25003, 25006);

### 4. Add Aug Bank Holiday future years (NOT YET RUN, prevention)

  INSERT INTO school_closures (name, start_date, end_date) VALUES
  ('August Bank Holiday', '2027-08-02', '2027-08-02'),
  ('August Bank Holiday', '2028-08-07', '2028-08-07'),
  ('August Bank Holiday', '2029-08-06', '2029-08-06'),
  ('August Bank Holiday', '2030-08-05', '2030-08-05');

## Risk / Category

- Assignments (BCs 88/25038): attendance untracked — urgent
- Gustavo BC 24967: human decision required (assign vs deactivate)
- New Aug 14 BCs (24/25004/25005): medium urgency, by Thu 13 Aug
- BC 24 (Amine Ibrani, AY): verify attendance status before assigning
- Data hygiene (25003/25006): cosmetic, low risk
- Reversible: yes. Blast radius: low.

Status: OPEN — fix NOT RUN
Last checked: Tue 4 Aug 2026 UTC (13th check)