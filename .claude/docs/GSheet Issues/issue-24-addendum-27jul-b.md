# Issue 24 — Alberto Squillace
Reporter: AC | Area: Booking / Class | Sheet row 25

CORRECTION from prior runs: H column previously referenced booking 2385.
Booking 2385 belongs to Wilfrid Lemaire (student 1611) — not Alberto.
Alberto Squillace (student 1052) = booking 1611 only.

Root cause (121st check Mon 27 Jul 2026 UTC):
- Booking 1611: confirmed, EUR 1280.12 fully paid
- Booking course 1797 (Morning General, Apr 6 – Jun 26): active=true, 31d stale
- Booking course 24686 (Morning General, Jul 20 – Sep 18): active=true, fee=0, 0 SCAs
- 5 school days lost week 1 (Jul 21-25) — irrecoverable
- Week 2 day 1 = Mon Jul 27

Fix recipe (NOT YET RUN):
1. Deactivate BC 1797: UPDATE "BookingCourse" SET active=false WHERE id=1797;
2. Set fee on BC 24686 (verify from HubSpot): UPDATE "BookingCourse" SET fee=X WHERE id=24686;
3. Assign BC 24686 to Morning General class via SIS admin (from WB Jul 27)

Risk: bookings/class-assignment | Reversible yes | single student
Status: OPEN — 121st check Mon 27 Jul UTC. Booking corrected: 1611 not 2385. 6d lost. Fix NOT RUN.
Last checked: 2026-07-27 UTC