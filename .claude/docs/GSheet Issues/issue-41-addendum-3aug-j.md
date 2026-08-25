Issue 41 -- Giampaolo Russo (80th check Mon 3 Aug 2026 UTC, 16th today)
Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Root Cause (fresh 3 Aug 2026 UTC):
- Booking 18180: CONFIRMED, confirmed=true, EUR 2,584.96 paid
- BC 24956 (General English AM, Aug 3-Sep 11 2026): active=true, 0 SCAs -- unchanged
- BC 24956 start_date=2026-08-03; after Issue 38 shunt: shifts to 2026-08-04
- BA 11357 (bed 178, host family, Aug 2-Sep 6 2026): active=true, fee=EUR 1,250 -- in place
- Capel Street BA (Sep 6-Sep 14 2026): still absent from booking 18180
- School resumes TOMORROW Tue 4 Aug 2026

Fix Recipe (NOT YET RUN):
Step 1: Run Issue 38 shunt first (shifts BC 24956 start_date to Aug 4).
Step 2: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end)
        SELECT 24956,b.student_id,CLASS_ID,2026-08-04,2026-09-11 FROM bookings b WHERE b.id=18180;
        (confirm class_id for General English AM running w/b Aug 4)
Step 3: INSERT INTO booking_accommodations (booking_id,bed_id,start_date,end_date,active,fee)
        VALUES (18180,BED_ID,2026-09-06,2026-09-14,true,FEE);
        (confirm bed_id and fee with Kelly/Diego)
Step 4 verify: SELECT ba.id,ba.bed_id,ba.start_date,ba.end_date FROM booking_accommodations ba WHERE ba.booking_id=18180;

Risk: bookings/accommodation/class | Reversible: yes | Blast: 1 student (Giampaolo Russo)
Status: 80th check Mon 3 Aug 2026 UTC (16th today). 0 SCAs. Capel BA missing. First class TOMORROW. URGENT.
Last checked: 2026-08-03 UTC