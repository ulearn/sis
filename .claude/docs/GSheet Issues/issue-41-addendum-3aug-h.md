Issue 41 - Giampaolo Russo (78th check Mon 3 Aug 2026 UTC, 14th today)
Reporter: KC | Area: Booking / Accomm | Sheet row: 43


ROOT CAUSE (fresh 3 Aug 2026 UTC):
- Booking 18180: CONFIRMED, confirmed=true, EUR 2,584.96 paid, EUR 0 open
- BC 24956 (General English AM, Aug 3-Sep 11 2026): active=true, 0 class assignments (confirmed fresh)
- BA 11357 (bed 178, host family, Aug 2-Sep 6 2026): active=true, fee EUR 1,250 - in place
- Capel Street BA (Sep 6-Sep 14 2026): NOT created in DB
- Today = Aug Bank Holiday; BC 24956 start shifts to 2026-08-04 after Issue 38 shunt
- First class TOMORROW Tue 4 Aug 2026 - URGENT


FIX RECIPE (NOT YET RUN):
1. Run Issue 38 shunt first (BC 24956 start_date shifts to Aug 4 automatically)
2. Create class assignment on BC 24956 (after shunt, week starting Tue 4 Aug):
   INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
   SELECT 24956, b.student_id, CLASS_ID, '2026-08-04', '2026-09-11' FROM bookings b WHERE b.id = 18180;
   (Confirm class_id for General English AM with admin)
3. Create Capel BA (Sep 6-Sep 14):
   INSERT INTO booking_accommodations (booking_id, accommodation_type, start_date, end_date, weeks, active, fee, bed_id)
   VALUES (18180, 'Capel Street', '2026-09-06', '2026-09-14', 1, true, FEE, BED_ID);
   (Confirm bed_id and fee with Kelly)


RISK: bookings/accommodation/class | Reversible: yes | Blast: 1 student (Giampaolo Russo)
STATUS: 78th check Mon 3 Aug 2026 UTC (14th today). Today=BH. First class TOMORROW Tue 4 Aug. URGENT. NOT YET RUN.