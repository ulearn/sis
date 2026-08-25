Issue 45 -- Eduardo Roche Diaz (Addendum 28 Jul 2026) -- Window Closed, 4 Days Stale

Reporter: AC | Area: Renewal students | Sheet row: 47

ROOT CAUSE (verified Tue 28 Jul 2026 UTC -- run 111)
- Booking course 25011 (General English PM, Jul 20-24 2026): active = true, ended Fri 24 Jul -- 4 days stale -- UNCHANGED
- Class assignment window permanently closed; attendance for Jul 20-24 irrecoverable
- Booking 18233: student 14602 Eduardo Roche Diaz, status = CONFIRMED
- Only BC on this booking; no subsequent BC exists
- B/F/G hash changed (formatting artefact in G column); data itself unchanged

FIX RECIPE (NOT YET RUN -- data hygiene only)
UPDATE booking_courses SET active = false WHERE id = 25011;
No attendance recovery possible.

RISK
Category: data-hygiene | Reversible: Yes (set active = true to undo) | Blast radius: 1 booking course

STATUS: WINDOW CLOSED -- 5 school days (Jul 20-24) permanently missed. Fix NOT RUN. Last checked: Tue 28 Jul 2026 UTC (run 111)

---
## 112th check Tue 28 Jul 2026 UTC
CONFIRMED. BC 25011 active=true, ended Jul 24 — 5 days stale (was 4d). 0 class assignments. Hash artefact (G formatting). Data hygiene only. Fix NOT RUN.
