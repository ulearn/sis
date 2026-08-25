Issue 24 — Alberto Squillace Fidelo Course Split / Fee Missing

Reporter: AC | Area: Booking | Sheet row: 25 | Check: 65th — Friday 17 Jul 2026

---

Symptom: Short-term student with Fidelo holidays; SIS created two courses instead of splitting.
Tried to assign holidays starting 27 Apr but system shows 2 courses: 12-week (ended 26 Jun) and 9-week (starts 20 Jul).
No HubSpot deal for second course.

Root cause — fresh DB 17 Jul 2026

- Booking course 24686 (Alberto Squillace, s1052, Morning General, 20 Jul-18 Sep 2026): fee = null
  Course starts MONDAY 20 July (3 days from now). Zero SCAs (not started yet, correct).
- Booking 1611: status CONFIRMED, confirmed=true.
- Booking course 1797 (Morning General, ended 26 Jun 2026): still active=true — 21 days stale.

---

Fix recipe — NOT YET RUN

1. Set fee on BC24686 BEFORE Monday 20 Jul:
   Check HubSpot deal for agreed fee amount for the 9-week course (20 Jul-18 Sep).
   UPDATE "BookingCourse" SET fee = <agreed_amount> WHERE id = 24686;

2. Deactivate stale BC1797:
   UPDATE "BookingCourse" SET active = false WHERE id = 1797;
   (Course ended 26 Jun 2026, been active=true for 21 days, safe to deactivate)

Note: The 2-course split is the Fidelo migration design — not a bug. Alberto had bereavement holidays
in Fidelo between the first and second course blocks. The data is correct structurally;
just need fee set before Monday and BC1797 deactivated.

Risk: bookings/data-hygiene | Fee update affects invoice | BC1797 deactivation safe + reversible | 1 student

Status: Open — NOT YET RUN. COURSE STARTS MONDAY 20 Jul.
Last checked: Friday 17 July 2026 UTC (65th check)

---
68th check Friday 17 July 2026 UTC

CONFIRMED UNCHANGED (fresh DB). BC24686 (Morning General, Jul20-Sep18): fee = STILL null. BC1797 (ended Jun26): active = STILL true (21 days stale). Course starts Mon 20 Jul — this is the final check before Monday. Fix NOT RUN.

---
70th check Friday 17 July 2026 UTC

CONFIRMED UNCHANGED (fresh DB). BC24686 (Alberto Squillace, Morning General, Jul20-Sep18 2026): fee = STILL null (fresh DB). Course starts Monday 20 July. BC1797 (Morning General, ended Jun26 2026): active = STILL true (21 days stale). Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (70th check, hourly bot).

---
71st check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24686 (Alberto Squillace, s1052, Morning General, Jul20-Sep18 2026): fee = STILL null, active = true, starts Monday 20 July. Booking 1611: Confirmed, confirmed=true, EUR 1280.12 / 1280.12. Booking course 1797 (Morning General, ended 26 Jun 2026): active = STILL true (21 days stale). TODAY IS LAST DAY to set fee before Monday start. Fix NOT RUN. NEIL: set fee on BC24686 (check HubSpot deal for amount). Last checked: 2026-07-17 FRI UTC (71st check, hourly bot).

---
72nd check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24686 (Alberto Squillace, Morning General, Jul 20-Sep 18 2026): fee = STILL null. Course starts Monday 20 July - TODAY IS THE LAST DAY to set fee. Booking course 1797 (Morning General, ended 26 Jun 2026): active = STILL true (21 days stale). Booking 1611: Confirmed, EUR 1280.12/1280.12 fully paid. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (72nd check, hourly bot).
---
76th check 2026-07-18 SAT UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24686 (Alberto Squillace, Morning General, Jul20-Sep18 2026): fee = STILL null. Course starts Monday 20 July. Booking course 1797 (ended Jun26 2026): active = STILL true (22 days stale). SCA also 0 — awaiting class assignment (see Issue 45). Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (76th check, hourly bot).

---
77th check 2026-07-18 SAT UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24686 (Alberto Squillace, Morning General, 20 Jul to 18 Sep 2026): fee = STILL null. Course starts Monday 20 July. Booking course 1797 (ended 26 Jun 2026): active = STILL true (22 days stale). Class assignment also 0 — see Issue 45. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (77th check, hourly bot).

---
81st check 2026-07-18 SAT UTC (15th today)

CONFIRMED UNCHANGED (fresh DB). Booking course 24686 (Alberto Squillace, Morning General, 20 Jul–18 Sep 2026): fee = STILL null. Course starts Monday 20 July (2 days away — not tomorrow; today is Saturday). Booking course 24616 (Mia Wehrli, GE AM Plus, 20 Jul–31 Jul 2026): fee = STILL null. Also starts Monday 20 July. Booking 1611 (Alberto): Confirmed EUR 1280.12 fully paid. Booking 17842 (Mia): Confirmed EUR 1149.90 fully paid. Booking course 1797 (ended Jun 26): active = STILL true (22 days stale). Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (81st check, hourly bot).

---
82nd check 2026-07-18 SAT UTC (16th today)

CONFIRMED UNCHANGED (fresh DB). Booking course 24686 (Alberto Squillace, Morning General, 20 Jul–18 Sep 2026): fee = STILL null. Course starts Monday 20 July (2 days). Booking course 24616 (Mia Wehrli, GE AM Plus, 20 Jul–31 Jul 2026): fee = STILL null. Also starts Monday 20 July. Booking 1611 (Alberto): Confirmed EUR 1280.12/1280.12 fully paid. Booking 17842 (Mia): Confirmed EUR 1149.90/1149.90 fully paid. Booking course 1797 (ended 26 Jun 2026): active = STILL true (22d stale). Class assignment = 0 for both BCs — see Issue 45. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (82nd check, 16th today, hourly bot).

---
83rd check Sun 19 Jul 2026 UTC (17th today)

CONFIRMED UNCHANGED (fresh DB, Sun 19 Jul).
Booking course 24686 (Alberto Squillace, Morning General, 20 Jul to 18 Sep 2026): fee = STILL null. Course starts TOMORROW Monday 20 July.
Booking course 24616 (Mia Wehrli, General English AM Plus, 20 Jul to 31 Jul 2026): fee = STILL null. Also starts TOMORROW Monday 20 July.
Booking 1611 (Alberto): Confirmed, EUR 1280.12 / 1280.12 fully paid.
Booking 17842 (Mia): Confirmed, EUR 1149.90 / 1149.90 fully paid.
Booking course 1797 (Morning General, ended 26 Jun 2026): active = STILL true — 23 days stale.
Fix NOT Run. Last checked: Sun 19 Jul 2026 UTC (83rd check, 17th today).

---

Status Update: Sun 19 Jul 2026 UTC (86th check, 19th today)

CONFIRMED UNCHANGED. Both fee-null BCs start TOMORROW Mon 20 Jul.
Booking course 24686 (Alberto Squillace, Morning General, 20 Jul to 18 Sep 2026, bk1611): fee = STILL null.
Booking course 24616 (Mia Wehrli, General English AM Plus, 20 Jul to 31 Jul 2026, bk17842): fee = STILL null.
Booking course 1797 (Morning General, ended 26 Jun 2026): STILL active=true (23 days stale).

Fix recipe - NOT YET RUN:
Step 1: Confirm agreed fees in HubSpot for bk1611 (Alberto 9wk) and bk17842 (Mia 2wk).
Step 2: UPDATE booking_courses SET fee = <agreed_fee_bk1611> WHERE id = 24686;
Step 3: UPDATE booking_courses SET fee = <agreed_fee_bk17842> WHERE id = 24616;
Step 4: UPDATE booking_courses SET active = false WHERE id = 1797;

Risk: data-hygiene; reversible; low blast radius (3 rows). Last checked: Sun 19 Jul 2026 UTC (86th check, hourly bot).

---
87th check Sun 19 Jul 2026 UTC (20th today)

CONFIRMED UNCHANGED (fresh DB).
Booking course 24686 (Alberto Squillace, Morning General, 20 Jul to 18 Sep 2026, bk1611 CONFIRMED paid EUR 1280.12/1280.12): fee = STILL null.
Booking course 24616 (Mia Wehrli, General English AM Plus, 20 Jul to 31 Jul 2026, bk17842 CONFIRMED paid EUR 1149.90/1149.90): fee = STILL null.
Booking course 1797 (Morning General, ended 26 Jun 2026): STILL active=true (23 days stale).
Both start TOMORROW Mon 20 Jul — fees needed before invoicing.
Fix Not Run. Last checked: Sun 19 Jul 2026 UTC (87th check, 20th today).
