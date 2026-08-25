Issue 37 - Veronica Martin (stale BAs, bed 83)
Reporter: AC | Area: Booking/Accomm | Sheet row: 39 | 25th check Wed 12 Aug 2026 UTC

Symptom: Student paid for accommodation but SIS shows no allocation.

Root Cause (confirmed):
  Current occupant of bed 83: BA 11173 (Aug 9-30 2026), fee EUR 1080 — active (day 3)
  Future on bed 83: BA 25 (bk 17844, Aug 30 - Oct 11 2026), fee EUR 2100
  5 stale BAs still active on bed 83 (all ended, none deactivated):
    BA 11239: ended 2026-05-24, 80 days stale, fee EUR 1050
    BA 11168: ended 2026-06-20, 53 days stale, fee EUR 700
    BA 11285: ended 2026-07-05, 38 days stale, fee null (verify before touching)
    BA 11352: ended 2026-07-11, 32 days stale, fee EUR 360
    BA 11179: ended 2026-08-09, now 3 days stale, fee EUR 1360

Fix Recipe (NOT YET RUN):
  Step 1 - Verify BA 11285 fee before deactivating (fee = null; confirm with Diego):
    SELECT * FROM booking_accommodations WHERE id = 11285;
  Step 2 - Deactivate the 5 stale BAs:
    UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
    (Only after confirming BA 11285 fee is OK to clear)

Risk: Accommodation data-hygiene. Reversible (set active=true). Blast radius: 5 BAs on bed 83.
Status: OPEN - NOT YET RUN. 25th check. BA 11179 newly stale (3 days).
Last checked: Wed 12 Aug 2026 UTC