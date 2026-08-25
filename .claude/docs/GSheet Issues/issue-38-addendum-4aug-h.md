# Issue 38 — Addendum 4 Aug 2026 (check 12h) — BC 24967 NEW urgent + Aug BH post-mortem

Reporter: AC | Area: Holidays, Bookings | Sheet row: 40 | Last checked: Tue 4 Aug 2026 UTC

## New Finding This Check

BC 24967 (Gustavo Da Silva, student 14570, booking 18179) was identified this check as a third
booking course ending Fri 7 Aug 2026 with 0 class assignments. It was absent from the previous H cell.

## Root Cause (live evidence, Tue 4 Aug 2026)

### URGENT — ends Fri 7 Aug 2026 (3 days)

- BC 88: Africa Mera Bachir (student 76, booking 82), Morning General, 0 SCAs
- BC 24967: Gustavo Da Silva (student 14570, booking 18179), General English AM, 0 SCAs — NEW this check
- BC 25038: Eduardo Roche Diaz (student 14602, booking 18258), General English PM, 0 SCAs

### Ends Fri 14 Aug 2026 (10 days) — no SCA

- BC 1144: ANAR-ERDENE BATBAYAR (588), Academic Year Morning
- BC 1305: Nomin Nergui (740), Academic Year Morning
- BC 1344: BAt-Orgil Baljinnyam (760), Academic Year Morning
- BC 1572: Ganchimeg Ganbaatar (886), Academic Year Afternoon
- BC 1591: Turbold Altankhuyag (901), Academic Year Morning

### Duplicate BC
BC 25003 = BC 25002 (both booking 18225, Aleix Cervera, dates 2026-08-03 to 2026-09-18). Deactivate 25003 only.

### Stale active BC
BC 25006 (Marina Larripa, ended 2026-08-03): active = true, 2 days stale.

### Aug Bank Holiday 2026-08-03 — ABSENT from DB (post-mortem)
school_closure table has 9 records: Good Friday 2026-2030 + Christmas 2026-2029. No Aug BH.
The holiday passed yesterday (Mon Aug 3). BC 24956 (Giampaolo Russo) started on BH without shunting.
Action: add Aug Bank Holiday 2027-08-02 and future years before next AY booking season.

## Fix Recipe (NOT YET RUN)

### 1. Assign URGENT BCs TODAY (Fri Aug 7 deadline)

SIS admin -> Bookings -> To Be Assigned:
- BC 88 (Africa Mera Bachir, student 76): assign Morning General class
- BC 24967 (Gustavo Da Silva, student 14570): assign General English AM class  [NEW]
- BC 25038 (Eduardo Roche Diaz, student 14602): assign General English PM class

### 2. Assign Aug 14 deadline BCs (by Thu 13 Aug)

BCs 1144, 1305, 1344, 1572, 1591 via SIS admin.

### 3. Deactivate stale/duplicate BCs (NOT YET RUN)

  UPDATE booking_course SET active = false WHERE id IN (25003, 25006);

### 4. Add Aug Bank Holiday for future years (NOT YET RUN, prevention only)

  INSERT INTO school_closure (name, start_date, end_date) VALUES
    ('August Bank Holiday', '2027-08-02', '2027-08-02'),
    ('August Bank Holiday', '2028-08-07', '2028-08-07'),
    ('August Bank Holiday', '2029-08-06', '2029-08-06'),
    ('August Bank Holiday', '2030-08-05', '2030-08-05');

## Risk / Category

- Assignments (BCs 88/24967/25038): attendance untracked, urgent — do today
- Data hygiene (BCs 25003/25006): cosmetic, low risk
- Future BH entries: prevention only
- Reversible: yes. Blast radius: low per action.

Status: OPEN — fix NOT RUN
Last checked: Tue 4 Aug 2026 UTC (12th check)
