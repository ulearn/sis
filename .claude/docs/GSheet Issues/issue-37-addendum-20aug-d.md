# Issue 37 Addendum 20 Aug 2026 Night — Bed 83 Stale Accommodations

Reporter: KC | Area: Booking / Accomm | Sheet rows: 39, 45 (Issue 43 duplicate)

Symptom: Paid accommodation not appearing in SIS allocation section.

Root cause (57th check, 20 Aug 2026 night — no change since 56th):
5 stale Booking Accommodations on bed 83, all active:
- BA 11239 (bk 22): ended 24 May 2026, 88 days stale, fee EUR 1,050
- BA 11168 (bk 92): ended 20 Jun 2026, 61 days stale, fee EUR 700
- BA 11285 (bk 17825): ended 5 Jul 2026, 46 days stale, fee null
- BA 11352 (bk 18156): ended 11 Jul 2026, 40 days stale, fee EUR 360
- BA 11179 (bk 82): ended 9 Aug 2026, 11 days stale, fee EUR 1,360
Current BA 11173 (bk 88): Aug 9-30, fee EUR 1,080 — correct.
Next BA 25 (bk 17844): starts 30 Aug, fee EUR 2,100 — 10 days away.
Booking 17825 (for BA 11285, fee null): CONFIRMED, fully paid EUR 2,008, open EUR 0.

Fix recipe (NOT YET RUN):

Step 1 - Set fee on BA 11285 (confirm exact accommodation amount with KC; bk 17825 total = EUR 2,008):
  UPDATE booking_accommodations SET fee = 2008 WHERE id = 11285;

Step 2 - Deactivate all 5 stale BAs:
  UPDATE booking_accommodations
  SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

Risk: bookings/accomm/data-hygiene | Reversible: yes | Deadline: before Aug 30
Status: No change. Aug 30 = 10 days. Last checked: 2026-08-20 night