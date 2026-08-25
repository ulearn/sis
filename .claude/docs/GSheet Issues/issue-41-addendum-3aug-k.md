# Issue 41 — Giampaolo Russo, Dual Accommodation (90th check, 19th today — Mon 3 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accommodation | Sheet row: 43

Root cause:
- BC 24956 (General English AM, bk18180): startDate=2026-08-03, active=true, 0 SCAs — start=bank holiday (Issue 38 pending)
- BA 11357 (bed 178, host family, Aug2-Sep6): active=true, fee=1250 — in place
- Capel Street BA (Sep6-Sep14): ABSENT from booking 18180 (only 1 BA in DB)
- First class Tue Aug4 at risk — depends on Issue 38 shunt

Fix recipe (NOT YET RUN):
Step 1 - Run Issue 38 shunt (prerequisite) — see issue-38-addendum-3aug-k.md
Step 2 - Create SCA on BC24956: p.studentClassAssignment.create({data:{bookingCourseId:24956,classId:11,weekEnd:new Date('2026-08-07')}}) — VERIFY classId
Step 3 - Add Capel BA: p.bookingAccommodation.create({data:{bookingId:18180,bedId:BED_ID,startDate:new Date('2026-09-06'),endDate:new Date('2026-09-14'),active:true,fee:'AMOUNT'}}) — confirm bed ID and fee with Neil/KC

Risk: bookings, low blast radius (1 student). Reversible. Urgency: first class Tue Aug4.
Status: OPEN — NOT RUN. Last checked: 2026-08-03 UTC (19th check today)