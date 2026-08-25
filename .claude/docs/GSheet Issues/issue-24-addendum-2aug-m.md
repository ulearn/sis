Issue 24 — Alberto Squillace (36th check, 16th today)

Reporter: pg | Area: Booking | Sheet row: 25

Symptom: Student was assigned holidays in Fidelo after bereavement; SIS has two BCs with a gap.

Root cause (confirmed Sun 2 Aug 2026 UTC):
- Student 1052 (Alberto Squillace), booking 1611
- BC 1797 (Morning General, 6 Apr to 26 Jun 2026): still active, 37 days stale, fee EUR 1836, 1 SCA (migration artifact)
- BC 24686 (Morning General, 20 Jul to 18 Sep 2026): active, fee = null, 0 SCAs
- BC 24686 start date is 2026-07-20 — it does NOT appear in the Aug 3 BH shunt list
- No booking_holiday records on booking 1611 (Fidelo holiday not migrated)
- Student return date: Tue 4 Aug 2026 (day after Aug Bank Holiday)
- SCA for week starting Tue 4 Aug on BC 24686 urgently needed

Fix recipe (NOT YET RUN):

Step 1 — Deactivate stale BC 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 2 — Set fee on BC 24686:
  Confirm correct fee with accounts, then:
  UPDATE booking_courses SET fee = <confirmed_amount> WHERE id = 24686;

Step 3 — Create SCA on BC 24686 for week 4 Aug:
  Via SIS admin: Classes > Assign > Alberto Squillace > week starting Mon 3 Aug 2026 (Tue 4 Aug after BH)
  Class: confirm with Adriana which class Alberto is in.

Risk: Bookings + Classes; low blast radius (1 student). Reversible.

Status: Fix NOT RUN — 36th check, 16th today Sun 2 Aug 2026 UTC