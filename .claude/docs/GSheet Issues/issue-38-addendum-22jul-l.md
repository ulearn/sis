# Issue 38 — Missing Bank Holiday School Closures
Reporter: Staff | Sheet row 40 | Check: 54th hourly, 127th total (Wed 22 Jul 2026 UTC)

## Root Cause
Fresh query (22 Jul 2026 UTC): 0 school_closure rows between 22 Jul and 1 Nov 2026.
Existing: Good Friday Apr 2026 (past), Christmas 2026-2029, Good Fridays 2027-2030.

Missing:
- August Bank Holiday: Mon 3 Aug 2026 — 12 calendar days away — URGENT
- October Bank Holiday: Mon 27 Oct 2026 — 96 calendar days away

Schema: id, created_at, name, start_date, end_date, note, is_paid_holiday

## Fix Recipe (NOT YET RUN)
INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday) VALUES
  ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish public holiday - first Monday in August', true),
  ('October Bank Holiday', '2026-10-27', '2026-10-27', 'Irish public holiday - last Monday in October', true);

After inserting: verify AY courses spanning Aug 3 are shunted forward.

## Risk: bookings | Reversible: yes (DELETE to undo) | Blast radius: medium (all AY courses spanning Aug 3 / Oct 27)
## Status: Open — Aug BH 12 days away. Last checked: Wed 22 Jul 2026 UTC