Issue 41 - Giampaolo Russo - 62nd check Thu 13 Aug 2026 UTC

Reporter: Diego  Area: Booking/Accomm  Sheet row: 43  Student: 14571

SYMPTOM: Apartment BA 11392 (Sep 6-14 2026) has bed_id = null. Check-in 24 days.

ROOT CAUSE (verified live):
- BA 11392: bed_id=null, Sep 6-14 2026, fee=EUR 415, active=true
- BA 11357 (host family): bed 178, Aug 2-Sep 6, fee=EUR 1250, active=true (correct)
- Booking 18180: CONFIRMED, confirmed=true
- Beds 168 (A1/Room 1) and 194 (Arasain-1) both verified available Sep 6-14 (0 conflicts)

FIX RECIPE (NOT YET RUN):
Step 1 - Neil chooses bed: 168 (A1/Room 1) or 194 (Arasain-1)
Step 2 - Confirm no conflicts: SELECT id,bed_id,start_date,end_date FROM booking_accommodations
         WHERE bed_id=<BED_ID> AND active=true AND start_date<'2026-09-14' AND end_date>'2026-09-06';
Step 3 - UPDATE booking_accommodations SET bed_id=<BED_ID>, updated_at=NOW() WHERE id=11392;
Step 4 - Verify: SELECT id,bed_id,start_date,end_date,fee FROM booking_accommodations WHERE id=11392;

RISK: bookings/accomm | Reversible: yes | Blast: 1 student
STATUS: OPEN. 62nd check. Fix NOT RUN. Both beds available.