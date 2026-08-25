Issue 41 - Giampaolo Russo (79th check Mon 3 Aug 2026 UTC, 15th today)
Reporter: KC | Area: Booking / Accomm | Sheet row: 43


ROOT CAUSE (fresh 3 Aug 2026 UTC):
- Booking 18180: CONFIRMED, confirmed=true, EUR 2,584.96 paid, EUR 0 open
- Booking course 24956 (General English AM, Aug 3-Sep 11 2026): active=true, 0 class assignments (confirmed fresh)
- Booking accommodation 11357 (bed 178, host family, Aug 2-Sep 6 2026): active=true, fee=EUR 1,250 -- in place
- Capel Street apartment BA (Sep 6-Sep 14 2026): NOT found on booking 18180 -- still missing
- Today = Aug Bank Holiday; BC 24956 start_date shifts to 2026-08-04 after Issue 38 shunt runs
- First class TOMORROW Tue 4 Aug 2026 -- URGENT


FIX RECIPE (NOT YET RUN):
1. Run Issue 38 shunt first -- this automatically shifts BC 24956 start_date to Aug 4.

2. Create class assignment on BC 24956 (confirm class_id with admin first):
   INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
   SELECT 24956, b.student_id, CLASS_ID, '2026-08-04', '2026-09-11' FROM bookings b WHERE b.id = 18180;
   (CLASS_ID = the General English AM class currently running -- verify with admin)

3. Create Capel Street BA (Sep 6-Sep 14):
   INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active, fee)
   VALUES (18180, BED_ID, '2026-09-06', '2026-09-14', true, FEE);
   (Confirm bed_id and fee with Kelly/Diego -- Capel Street apartment booking)


RISK: bookings/accommodation/class | Reversible: yes | Blast: 1 student (Giampaolo Russo)
STATUS: 79th check Mon 3 Aug 2026 UTC (15th today). Today=BH. First class TOMORROW Tue 4 Aug. URGENT. NOT YET RUN.
