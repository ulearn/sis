Issue 41 - Giampaolo Russo (bedId null for Sep 6-14 accomm)
Reporter: AC | Area: Booking/Accomm | Sheet row: 43 | 52nd check Wed 12 Aug 2026 UTC

Symptom: Student has two accommodation types; Sep 6-14 Capel Street period unassigned.

Root Cause (confirmed):
  BA 11357 (host family, bk 18227): bed 178, 2 Aug - 6 Sep 2026, active — correct
  BA 11392 (Capel Street, 6-14 Sep 2026): bedId = null, fee = EUR 415 — not yet assigned
  Bed 168 (property A1, Capel Street): confirmed free for 6-14 Sep 2026 (prior checks)
  25 days until Sep 6 check-in

Fix Recipe (NOT YET RUN):
  Step 1 - Confirm property A1 / bed 168 is correct for this booking (check with Diego):
    SELECT b.id, b.name, r.name as room FROM beds b JOIN rooms r ON r.id = b.room_id JOIN properties p ON p.id = r.property_id WHERE b.id = 168;
  Step 2 - Assign bed 168 to BA 11392:
    UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392;
  Step 3 - Verify no conflicting active BAs on bed 168 for Sep 6-14:
    SELECT * FROM booking_accommodations WHERE bed_id = 168 AND active = true
      AND start_date < 2026-09-14 AND end_date > 2026-09-06;

Risk: Accommodation assignment. Reversible (SET bed_id = null). Blast radius: 1 BA.
Status: OPEN - NOT YET RUN. 52nd check. 25 days to Sep 6 check-in.
Last checked: Wed 12 Aug 2026 UTC