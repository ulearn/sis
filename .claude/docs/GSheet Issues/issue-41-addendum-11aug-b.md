ISSUE 41 — Giampaolo Russo: Bed Assignment (46th Check)

Reporter: KC | Sheet row: 43 | Check: 46th Tue 11 Aug 2026 UTC

Current state (unchanged from 45th):
• BA 11392 (Giampaolo Russo, student 14571): City Centre Apartment Premium
  startDate=2026-09-06, endDate=2026-09-14, bedId=null, roomId=null
  26 days until check-in
• Bed 168: room=A1/Room 1, property=A1 — free during 2026-09-06 to 2026-09-14 (no conflicts)
  Nearest neighbours: BA 11218 ends 2026-09-05, BA 32 starts 2026-09-27

VERIFICATION NEEDED: Confirm property A1 is the correct Capel Street apartment for this booking before assigning bed 168.

Fix (NOT YET RUN):
1. Verify: SIS admin > Accommodation > Properties > find property A1 = Capel Street apt? 
2. After confirming, assign via SIS admin or SQL:
   UPDATE booking_accommodations SET bed_id=168, updated_at=NOW() WHERE id=11392;
3. If roomId also needed:
   SELECT room_id FROM accommodation_beds WHERE id=168;
   UPDATE booking_accommodations SET room_id=[room_id], updated_at=NOW() WHERE id=11392;

Risk: bookings/accommodation. Reversible: yes. Blast: single student.
Status: 26d to check-in. Bed 168 free. Fix NOT RUN — verify property first.
Last checked: Tue 11 Aug 2026 UTC (46th check)