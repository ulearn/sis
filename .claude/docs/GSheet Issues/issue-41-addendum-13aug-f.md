Issue 41 -- Giampaolo Russo / BA 11392 (Thu 13 Aug 2026)

Reporter: Diego/Laura | Area: Booking/Accomm | Sheet row: 43
65th check -- Thu 13 Aug 2026 ~16:04 UTC

Symptom:
Student's apartment accommodation (Sep 6-14) has no bed assigned. 24 days to check-in.

Root Cause (evidence):
- Booking Accommodation 11392: bedId=null, startDate=2026-09-06, endDate=2026-09-14, fee=EUR 415, active=true
- Booking Accommodation 11357 (host family Aug 2-Sep 6): bedId=178, fee=EUR 1,250 -- correctly assigned
- Bed 168 (A1/Room 1): still available Sep 6-14 (no conflicts in DB)
- Bed 194 (Arasain-1): still available Sep 6-14 (no conflicts in DB)
- No change since 64th check

Fix Recipe (NOT YET RUN):

Step 1: Confirm with Diego whether bed 168 (A1) or bed 194 (Arasain-1) should be assigned.

Step 2: In SIS Admin: Booking for Giampaolo Russo > Accommodation > BA 11392
  Assign bed 168 or 194 to Booking Accommodation 11392.
  Or via DB: UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392;  -- NOT YET RUN

Risk: bookings/accommodation | Reversible: yes | Blast radius: 1 student, 1 accomm booking
Check-in: Sep 6 2026 (24 days away)

Status: OPEN. Bed null. Two candidate beds available. Sep 6 check-in.
Last checked: Thu 13 Aug 2026 ~16:04 UTC
Previous recipe: issue-41-addendum-13aug-e.md